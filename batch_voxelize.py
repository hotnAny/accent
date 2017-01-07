#!/usr/bin/env python

##########################################################################
#
#   batch-voxelize objects, v0.0 01/2017
#
#   by xiangchen@acm.org
#
##########################################################################

from analyze_stress import _voxelize, _save

if __name__ == "__main__":
    dim = 64

    objs = []
    objs.append('teapot')
    objs.append('curtain_hook')
    objs.append('breakable_a_v2')
    objs.append('breakable_b_v2')
    objs.append('pikachu')
    objs.append('bunny')
    objs.append('brackets')  # http://www.thingiverse.com/thing:1538314
    objs.append('bagholder')  # http://www.thingiverse.com/thing:26767

    for obj in objs:
        try:
            print 'voxelizing', obj,  '...'
            objpath = 'things/' + obj + '.stl'
            vxginfo = _voxelize(objpath, dim)
            vxg = vxginfo['voxelgrid']
            _save(str(vxginfo['dimvoxel']) + '\n' + str(vxg),
                  obj + '_' + str(dim) + '.vxg')
            break
        except:
            print 'an error occurred!'
            continue
