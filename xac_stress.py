#!/usr/bin/env python

##########################################################################
#
#   stress analysis routine
#
#   by xiangchen@acm.org
#
##########################################################################

from __future__ import print_function

# require numpy, pysparse

import time as time

T = int(round(time.time() * 1000))
t0 = T

def log(msg):
    global T
    t = int(round(time.time() * 1000))
    if msg != None:
        print(msg + ':' + str(t - T) + 'ms')
    T = t
    return t

log(None)

from sys import argv
import numpy as np
from math import sqrt
from pysparse import spmatrix, itsolvers, precon, superlu
import struct

import xac_stress_test as test

log('importing everything')

global Ke, B, C
Ke = np.load('H8.K')
B = np.matrix(np.load('H8.B'))
C = np.matrix(np.load('H8.C'))

log('global constant variables')

def node_nums_3d(nelx, nely, nelz, mpx, mpy, mpz):
    innback = np.array([0, 1, nely + 1, nely + 2]) #  initial node numbers at back
    enback = nely * (mpx - 1) + mpy
    nnback = innback + enback + mpx - 1
    nnfront = nnback + (nelx + 1) * (nely + 1)
    nn = np.hstack((nnback, nnfront)) + (mpz - 1) * (nelx + 1) * (nely + 1)
    return nn

def _sub(b, a):
    return [b[0]-a[0], b[1]-a[1], b[2]-a[2]]

def _dot(u, v):
    return u[0]*v[0] + u[1]*v[1] + u[2]*v[2]

def _cross(u, v):
    return [u[1]*v[2]-u[2]*v[1], u[0]*v[2]-u[2]*v[0], u[0]*v[1]-u[1]*v[0]]

def _normsq(v):
    return v[0]*v[0] + v[1]*v[1] + v[2]*v[2]

def _on_same_side(p1, p2, a, b):
    ab = _sub(b, a)
    cp1 = _cross(ab, _sub(p1, a))
    cp2 = _cross(ab, _sub(p2, a))

    sameside = False
    if _normsq(cp1) != 0 or _normsq(cp2) != 0:
        sameside = _dot(cp1, cp2) > 0
    else:
        sameside = True

    return sameside

def _in_triangle(v, va, vb, vc):
    return _on_same_side(v, va, vb, vc) and \
    _on_same_side(v, vb, va, vc) and \
    _on_same_side(v, vc, va, vb)

def _voxelize(bstl, n):
    """
    input:
        bstl - path to a binary stl file
        n - max # of voxels along x, y and z
    loading triangles from an stl file, adopted from https://github.com/arizonat/py-stl-toolkit
    return: said triangles
    """
    log(None)

    print('loading stl file ......', end='')
    try:
        f = open(bstl, 'rb')
    except IOError:
        raise TypeError('must be the path to a mesh file')

    header = f.read(80)
    numTriangles = struct.unpack("@i", f.read(4))
    numTriangles = numTriangles[0]

    triangles = [(0,0,0)]*numTriangles # prealloc, slightly faster than append
    norms = [(0,0,0)]*numTriangles
    bytecounts = [(0,0,0)]*numTriangles

    for i in xrange(numTriangles):
        norms[i] = struct.unpack("<3f", f.read(12))
        vertex1 = struct.unpack("<3f", f.read(12))
        vertex2 = struct.unpack("<3f", f.read(12))
        vertex3 = struct.unpack("<3f", f.read(12))
        bytecounts[i] = struct.unpack("H", f.read(2)) # not sure what this is

        triangles[i] = (vertex1, vertex2, vertex3)

    # compute voxel dimension
    INF = float('inf')
    vmin = [INF, INF, INF]
    vmax = [-INF, -INF, -INF]
    centers = []
    for t in triangles:
        ctr = [0, 0, 0]
        for v in t:
            for i in range(0, 3):
                vmin[i] = min(v[i], vmin[i])
                vmax[i] = max(v[i], vmax[i])
                ctr[i] += v[i]/3
        centers.append(ctr)

    dim = max(vmax[0]-vmin[0], vmax[1]-vmin[1], vmax[2]-vmin[2]) / n
    nx = int((vmax[0]-vmin[0]) / dim + 0.5)
    ny = int((vmax[1]-vmin[1]) / dim + 0.5)
    nz = int((vmax[2]-vmin[2]) / dim + 0.5)

    log('done')
    print('num of triangles', len(triangles))
    print('voxel grid: ' + str(nx) + ' x ' + str(ny) + ' x ' + str(nz))

    vxg = []

    # per voxel ray casting
    NUMDIR = 3
    cntr = 1
    for i in range(0, nz):
        vxgplane = []
        for j in range(0, ny):
            vxgrow = []
            for k in range(0, nx):
                perc = cntr*100.0/(nx*ny*nz)
                print('voxelizing ...... ' + str(int(perc)) + '%', end='\r')
                # print('voxelizing ...... ' + str(int(perc)) + '%', end='\r')

                ctrvoxel = [(k+0.5)*dim, (j+0.5)*dim, (i+0.5)*dim]
                counter = [[0,0], [0,0], [0,0]]
                for h in range(0, len(triangles)):
                    t = triangles[h]
                    ctrface = centers[h]
                    for l in range(0, NUMDIR):
                        projctrvoxel = list(ctrvoxel)
                        projva, projvb, projvc = list(t[0]), list(t[1]), list(t[2])
                        if l==0:
                            projctrvoxel[0] = 0
                            projva[0] = 0
                            projvb[0] = 0
                            projvc[0] = 0
                            if _in_triangle(projctrvoxel, projva, projvb, projvc):
                                counter[l][0 if ctrvoxel[0] < ctrface[0] else 1] += 1
                        elif l==1:
                            projctrvoxel[1] = 0
                            projva[1] = 0
                            projvb[1] = 0
                            projvc[1] = 0
                            if _in_triangle(projctrvoxel, projva, projvb, projvc):
                                counter[l][0 if ctrvoxel[1] < ctrface[1] else 1] += 1
                        elif l==2:
                            projctrvoxel[2] = 0
                            projva[2] = 0
                            projvb[2] = 0
                            projvc[2] = 0
                            if _in_triangle(projctrvoxel, projva, projvb, projvc):
                                counter[l][0 if ctrvoxel[2] < ctrface[2] else 1] += 1

                isvoxel = False
                for l in range(0, NUMDIR):
                    if counter[l][0]%2 == 1 and counter[l][1]%2 == 1:
                        isvoxel = True
                        break
                vxgrow.append(1 if isvoxel else 0)
                cntr+=1
            vxgplane.append(vxgrow)
        vxg.append(vxgplane)

    print('')
    log('done')
    return vxg

def _load_vxg(vxgpath):
    vxgraw = open(vxgpath, 'r').read()
    idxdim = vxgraw.index('\n')
    dim = float(vxgraw[:idxdim])
    vxgraw = vxgraw[idxdim+1:]

    vxg = []
    vxgplanes = vxgraw.split('\n\n')
    for plane in vxgplanes:
        vxgplane = []
        planeraw = plane.split('\n')
        for row in planeraw:
            vxgrow = []
            rowraw = row.split(',')
            for vx in rowraw:
                try:
                    vxgrow.append(int(vx))
                except:
                    continue
            if len(vxgrow) > 0:
                vxgplane.append(vxgrow)
        vxg.append(vxgplane)
    return vxg

# input:
#   - vxgpath: path to voxel grid file
#   - loads: each consisting of
#       * points
#       * value
#   - boundary
#       * points
#
# output:
#   - displacement vector
def analyze(path, n, loads, boundary, iter):
    global Ke, B, C

    print('mesh or voxel grid path: ' + path)

    # load voxel grid
    # vxg = _load_vxg(vxgpath)
    vxg = _voxelize(path, n)
    nz = len(vxg)
    ny = len(vxg[0])
    nx = len(vxg[0][0])
    log('voxelization')

    # compute stiffness matrix for individual elements
    DOF = 3
    ksize = DOF * (nx+1) * (ny+1) * (nz+1)
    kall = spmatrix.ll_mat_sym(ksize, ksize)
    # print kall
    # for i in range(0, ksize):
    #     kall.append([0] * ksize)

    SOLID = 1.000
    VOID = 0.001
    for i in range(0, nz):
        for j in range(0, ny):
            for k in range(0, nx):
                xe = SOLID if vxg[i][j][k] == 1 else VOID
                nodes = node_nums_3d(nx, ny, nz, k+1, j+1, i+1)
                ind = []
                for n in nodes:
                    ind.extend([(n-1)*DOF, (n-1)*DOF+1, (n-1)*DOF+2])
                mask = np.ones(len(ind), dtype=int)
                kall.update_add_mask_sym(Ke * xe, ind, mask)

    log('updated stiffness matrix for all elements')

    # formulate loading scenario
    rall = [0] * ksize
    indices = loads['points']
    value = loads['value']

    for idx in indices:
        nodes = node_nums_3d(nx, ny, nz, idx[0]+1, idx[1]+1, idx[2]+1)
        for j in range(0, DOF):
            for k in range(0, len(nodes)):
                rall[DOF * (nodes[k]-1) + j] = value[j]

    # formulate boundary condition
    elemmask = [1] * (nx+1) * (ny+1) * (nz+1)
    for idx in boundary:
        nodes = node_nums_3d(nx, ny, nz, idx[0]+1, idx[1]+1, idx[2]+1)
        for j in range(0, len(nodes)):
            elemmask[nodes[j] - 1] = 0

    freedofs = []
    fixeddofs = []
    for i in range(0, len(elemmask)):
        if elemmask[i] == 1:
            freedofs.extend((DOF*i, DOF*i+1, DOF*i+2))
        else:
            fixeddofs.extend((DOF*i, DOF*i+1, DOF*i+2))

    log('formulated loading scenario and boundary condition')

    # solve KU=F
    rfree = np.take(rall, freedofs)
    dfree = np.empty(len(freedofs))

    alldofs = np.arange(ksize)
    rcfixed = np.where(np.in1d(alldofs, fixeddofs), 0, 1)
    kfree = kall
    kfree.delete_rowcols(rcfixed)

    log('removed constrained elements')

    if iter:
        kfree = kfree.to_sss()
        prek = precon.ssor(kfree)
        (info, numitr, relerr) = itsolvers.pcg(kfree, rfree, dfree, 1e-8, 8000, prek)
        if info >= 0:
            print('converged after ' + str(numitr) + ' iterations with error of ' + str(relerr))
        else:
            print('PySparse error: Type:' + info + ', at' + str(numitr) + 'iterations.')
    else:
        kfree = kfree.to_csr()
        lu = superlu.factorize(kfree)
        lu.solve(rfree, dfree)

    log('solved KU=F')

    dall = np.zeros_like(rall);
    for i in range(0, len(freedofs)):
        dall[freedofs[i]] = dfree[i]

    # compute stress
    cb = C*B
    vonmises = []
    for i in range(0, nz):
        vmplane = []
        for j in range(0, ny):
            vmrow = []
            for k in range(0, nx):
                nodes = node_nums_3d(nx, ny, nz, k+1, j+1, i+1)
                disps = []
                for n in nodes:
                    disps.extend([dall[DOF*(n-1)], dall[DOF*(n-1)+1], dall[DOF*(n-1)+2]])
                d = np.matrix(disps).transpose()
                sigma = cb*d
                # sigma = np.array(sigma).astype('float')
                # sigmas.append([x[0] for x in sigma])
                s11 = sigma.item(0, 0)
                s22 = sigma.item(1, 0)
                s33 = sigma.item(2, 0)
                s12 = sigma.item(3, 0) * 0.5        # DOUBLE CHECK THIS
                s23 = sigma.item(4, 0) * 0.5
                s31 = sigma.item(5, 0) * 0.5

                # von Mises stress
                vmrow.append(sqrt(0.5*((s11-s22)**2 + (s22-s33)**2 + (s33-s11)**2 +\
                 6*(s12**2 + s23**2 + s31**2))))
            vmplane.append(vmrow)
        vonmises.append(vmplane)


    t1 = log('computed stress')

    global t0
    print('total time:' + str(t1-t0) + ' ms')

    return {'disp': dall.tolist(), 'stress': vonmises}

#
#   main function entry point
#
if __name__ == "__main__":
    # result = analyze(test.MESHPATH2, 64, test.LOAD2, test.BC2, True)
    # result = analyze(VXGPATH1, LOAD1, BC1, True)

    _voxelize(test.MESHPATH3, 64)

    # disp = result['disp']
    # f = open(str(long(time.time())) + '.disp', 'w')
    # f.write(str(disp))
    # f.close()

    # stress = result['stress']
    # f = open(str(long(time.time())) + '.strs', 'w')
    # f.write(str(stress))
    # f.close()
    # print np.array([0, 2, 1]) + np.array([2, 3, 1])
