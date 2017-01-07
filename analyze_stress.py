#!/usr/bin/env python

##########################################################################
#
#   stress analysis routine, v0.1 01/2017
#
#   by xiangchen@acm.org
#
#   ! require numpy, pysparse
#
##########################################################################


from __future__ import print_function

import time as time

T = int(round(time.time() * 1000))
t0 = T


def _log(msg):
    global T
    t = int(round(time.time() * 1000))
    if msg != None:
        print(msg + ': ' + str(t - T) + 'ms')
    T = t
    return t

_log(None)

from sys import argv
import argparse
import json
import ast
import numpy as np
from math import sqrt
from pysparse import spmatrix, itsolvers, precon, superlu
import struct

_log('importing everything')

Ke = np.load('H8.K')
B = np.matrix(np.load('H8.B'))
C = np.matrix(np.load('H8.C'))

_log('global constant variables')


def _save(data, name):
    f = open(name, 'w')
    f.write(str(data))
    f.close()
    print('saved to ' + name)


def _node_nums_3d(nelx, nely, nelz, mpx, mpy, mpz):
    """
    adopted from Topy (https://github.com/williamhunter/topy)
    compute node number based on element number
    """
    innback = np.array([0, 1, nely + 1, nely + 2])  # initial node numbers at back
    enback = nely * (mpx - 1) + mpy
    nnback = innback + enback + mpx - 1
    nnfront = nnback + (nelx + 1) * (nely + 1)
    nn = np.hstack((nnback, nnfront)) + (mpz - 1) * (nelx + 1) * (nely + 1)
    return nn


def _sub(u, v):
    return [u[0] - v[0], u[1] - v[1], u[2] - v[2]]


def _dot(u, v):
    return u[0] * v[0] + u[1] * v[1] + u[2] * v[2]


def _cross(u, v):
    return [u[1] * v[2] - u[2] * v[1], u[0] * v[2] - u[2] * v[0], u[0] * v[1] - u[1] * v[0]]


def _normsq(v):
    return v[0] * v[0] + v[1] * v[1] + v[2] * v[2]


def _on_same_side(p1, p2, a, b):
    """
    compute if p1 and p2 are on the same side as segment ab
    """
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
    """
    tell if v is inside a triangle define by va, vb and vc
    """
    return _on_same_side(v, va, vb, vc) and \
        _on_same_side(v, vb, va, vc) and \
        _on_same_side(v, vc, va, vb)


def _voxelize(bstl, n):
    """
    voxelize a mesh
    input:
        bstl - path to a binary stl file
        n    - max # of voxels along x, y and z
    return:
        said triangles
    reference:
        loading triangles from an stl file, adopted from https://github.com/arizonat/py-stl-toolkit
    """
    _log(None)

    print('loading stl file ......', end='')
    try:
        f = open(bstl, 'rb')
    except IOError:
        raise TypeError('must be the path to a mesh file')

    header = f.read(80)
    numTriangles = struct.unpack("@i", f.read(4))
    numTriangles = numTriangles[0]

    triangles = [(0, 0, 0)] * numTriangles  # prealloc, slightly faster than append
    norms = [(0, 0, 0)] * numTriangles
    bytecounts = [(0, 0, 0)] * numTriangles

    for i in xrange(numTriangles):
        norms[i] = struct.unpack("<3f", f.read(12))
        vertex1 = struct.unpack("<3f", f.read(12))
        vertex2 = struct.unpack("<3f", f.read(12))
        vertex3 = struct.unpack("<3f", f.read(12))
        bytecounts[i] = struct.unpack("H", f.read(2))  # not sure what this is

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
                ctr[i] += v[i] / 3
        centers.append(ctr)

    dim = max(vmax[0] - vmin[0], vmax[1] - vmin[1], vmax[2] - vmin[2]) / n
    nx = int((vmax[0] - vmin[0]) / dim + 0.5)
    ny = int((vmax[1] - vmin[1]) / dim + 0.5)
    nz = int((vmax[2] - vmin[2]) / dim + 0.5)

    _log('done')
    print('num of triangles', len(triangles))

    vxg = []

    # per voxel ray casting
    NUMDIR = 3
    cntr = 1
    for i in range(0, nz):
        vxgplane = []
        for j in range(0, ny):
            vxgrow = []
            for k in range(0, nx):
                perc = cntr * 100.0 / (nx * ny * nz)
                print('voxelizing ............ ' + str(int(perc)) + '%', end='\r')

                ctrvoxel = [vmin[0] + (k + 0.5) * dim, vmin[1] + (j + 0.5)
                            * dim, vmin[2] + (i + 0.5) * dim]
                counter = [[0, 0], [0, 0], [0, 0]]
                for h in range(0, len(triangles)):
                    t = triangles[h]
                    ctrface = centers[h]
                    for l in range(0, NUMDIR):
                        projctrvoxel = list(ctrvoxel)
                        projva, projvb, projvc = list(t[0]), list(t[1]), list(t[2])
                        if l == 0:
                            projctrvoxel[0] = 0
                            projva[0] = 0
                            projvb[0] = 0
                            projvc[0] = 0
                            if _in_triangle(projctrvoxel, projva, projvb, projvc):
                                counter[l][0 if ctrvoxel[0] < ctrface[0] else 1] += 1
                        elif l == 1:
                            projctrvoxel[1] = 0
                            projva[1] = 0
                            projvb[1] = 0
                            projvc[1] = 0
                            if _in_triangle(projctrvoxel, projva, projvb, projvc):
                                counter[l][0 if ctrvoxel[1] < ctrface[1] else 1] += 1
                        elif l == 2:
                            projctrvoxel[2] = 0
                            projva[2] = 0
                            projvb[2] = 0
                            projvc[2] = 0
                            if _in_triangle(projctrvoxel, projva, projvb, projvc):
                                counter[l][0 if ctrvoxel[2] < ctrface[2] else 1] += 1

                isvoxel = False
                for l in range(0, NUMDIR):
                    if counter[l][0] % 2 == 1 and counter[l][1] % 2 == 1:
                        isvoxel = True
                        break
                vxgrow.append(1 if isvoxel else 0)
                cntr += 1
            vxgplane.append(vxgrow)
        vxg.append(vxgplane)

    print('')
    _log('done')
    return {'dimvoxel': dim, 'voxelgrid': vxg}


def _load_vxg(vxgpath):
    """
    load a voxel grid file
    """
    vxgraw = open(vxgpath, 'r').read()
    idxdim = vxgraw.index('\n')
    dim = float(vxgraw[:idxdim])
    vxgraw = vxgraw[idxdim + 1:]
    vxg = ast.literal_eval(vxgraw)
    return vxg


def analyze(vxg, loads, boundary, iter):
    """
    main analysis function
       - vxg: voxel grid (3d list)
       - loads: each consisting of
           * points [point set #1, point set #2 ...]
           * value [value #1, value #2, ...]
       - boundary
           * points
       - iter: whether to use iterative or direct solver
        (points are element numbers)
    output:
       - displacement vector
       - von Mises stress vector
    """
    global Ke, B, C

    nz = len(vxg)
    ny = len(vxg[0])
    nx = len(vxg[0][0])
    _log('voxelization')
    print('voxel grid: ' + str(nx) + ' x ' + str(ny) + ' x ' + str(nz))

    # compute stiffness matrix for individual elements
    DOF = 3
    ksize = DOF * (nx + 1) * (ny + 1) * (nz + 1)
    kall = spmatrix.ll_mat_sym(ksize, ksize)

    SOLID = 1.000
    VOID = 0.001
    for i in range(0, nz):
        for j in range(0, ny):
            for k in range(0, nx):
                xe = SOLID if vxg[i][j][k] == 1 else VOID
                nodes = _node_nums_3d(nx, ny, nz, k + 1, j + 1, i + 1)
                ind = []
                for n in nodes:
                    ind.extend([(n - 1) * DOF, (n - 1) * DOF + 1, (n - 1) * DOF + 2])
                mask = np.ones(len(ind), dtype=int)
                kall.update_add_mask_sym(Ke * xe, ind, mask)

    _log('updated stiffness matrix for all elements')

    # formulate loading scenario
    rall = [0] * ksize
    indicesset = loads['points']
    values = loads['values']

    for i in range(0, len(indicesset)):
        indices = indicesset[i]
        value = values[i]
        for idx in indices:
            nodes = _node_nums_3d(nx, ny, nz, idx[0] + 1, idx[1] + 1, idx[2] + 1)
            for j in range(0, DOF):
                for k in range(0, len(nodes)):
                    rall[DOF * (nodes[k] - 1) + j] = value[j]

    # formulate boundary condition
    elemmask = [1] * (nx + 1) * (ny + 1) * (nz + 1)
    for idx in boundary:
        nodes = _node_nums_3d(nx, ny, nz, idx[0] + 1, idx[1] + 1, idx[2] + 1)
        for j in range(0, len(nodes)):
            elemmask[nodes[j] - 1] = 0

    freedofs = []
    fixeddofs = []
    for i in range(0, len(elemmask)):
        if elemmask[i] == 1:
            freedofs.extend((DOF * i, DOF * i + 1, DOF * i + 2))
        else:
            fixeddofs.extend((DOF * i, DOF * i + 1, DOF * i + 2))

    _log('formulated loading scenario and boundary condition')

    # solve KU=F
    rfree = np.take(rall, freedofs)
    dfree = np.empty(len(freedofs))

    alldofs = np.arange(ksize)
    rcfixed = np.where(np.in1d(alldofs, fixeddofs), 0, 1)
    kfree = kall
    kfree.delete_rowcols(rcfixed)

    _log('removed constrained elements')

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

    _log('solved KU=F')

    dall = np.zeros_like(rall)
    for i in range(0, len(freedofs)):
        dall[freedofs[i]] = dfree[i]

    # compute stress
    cb = C * B
    vonmises = []
    for i in range(0, nz):
        vmplane = []
        for j in range(0, ny):
            vmrow = []
            for k in range(0, nx):
                nodes = _node_nums_3d(nx, ny, nz, k + 1, j + 1, i + 1)
                disps = []
                for n in nodes:
                    disps.extend([dall[DOF * (n - 1)], dall[DOF * (n - 1) + 1],
                                  dall[DOF * (n - 1) + 2]])
                d = np.matrix(disps).transpose()
                sigma = cb * d

                s11 = sigma.item(0, 0)
                s22 = sigma.item(1, 0)
                s33 = sigma.item(2, 0)
                s12 = sigma.item(3, 0) * 0.5        # DOUBLE CHECK THIS
                s23 = sigma.item(4, 0) * 0.5
                s31 = sigma.item(5, 0) * 0.5

                # von Mises stress, cf. Strava et al.'s Stress Relief paper (SIGGRAPH '12)
                vmrow.append(sqrt(0.5 * ((s11 - s22)**2 + (s22 - s33)**2 + (s33 - s11)**2 +
                                         6 * (s12**2 + s23**2 + s31**2))))
            vmplane.append(vmrow)
        vonmises.append(vmplane)

    t1 = _log('computed stress')

    global t0
    print('total time:' + str(t1 - t0) + ' ms')

    return {'displacements': dall.tolist(), 'stress': vonmises}


if __name__ == "__main__":
    """
    main function entry point
    """
    # setting up parameters
    parser = argparse.ArgumentParser(description='stress analysis')
    parser.add_argument('path', metavar='path', type=str,
                        help='path to a .stl (mesh) or .vxg (voxel grid) file')
    parser.add_argument('-d', dest='dimension', nargs='?', default=32,
                        help='dimension of the voxel grid (if want to perform voxelization, default is 32)')
    parser.add_argument('-c', dest='config',
                        help='path to a configuration file (.json) describing loading scenario and boundary condition')
    parser.add_argument('-o', dest='output', nargs='?', default='result',
                        help='output path for analysis results: displacements and stress')
    args = parser.parse_args()

    # parsing configuration
    config = json.loads(open(args.config, 'r').read())
    boundary = config['boundary']
    loads = {'points': config['loadpoints'], 'values': config['loadvalues']}

    # creating or loading voxel grid
    vxg = None
    if args.path.endswith('.stl'):
        vxginfo = _voxelize(args.path, int(args.dimension))
        vxg = vxginfo['voxelgrid']
        _save(str(vxginfo['dimvoxel']) + '\n' + str(vxg),
              args.path.split('.')[0] + '_' + str(args.dimension) + '.vxg')
    elif args.path.endswith('.vxg'):
        vxg = _load_vxg(args.path)
    else:
        raise TypeError('must be .stl (mesh) or .vxg (voxel grid) file')

    # performing analysis
    if vxg != None:
        result = analyze(vxg, loads, boundary, True)
        if args.output != None:
            _save(result['displacements'], args.output + '.disp')
            _save(result['stress'], args.output + '.strs')
    else:
        raise ValueError('cannot create or load voxel grid')
