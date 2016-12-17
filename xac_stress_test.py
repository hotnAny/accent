#!/usr/bin/env python

##########################################################################
#
#   test data sets for stress analysis
#
#   by xiangchen@acm.org
#
##########################################################################

# test data 0
VXGPATH0 = 'things/beam1a_32.vxg'
VXGNZ0 = 6
VXGNY0 = 6
VXGNX0 = 32
LOAD0 = {'points': [[VXGNX0-1, 0, VXGNZ0/2]], 'value': [0.0, -1.0, 0.0]}
BC0 = []
for i in range(0, VXGNZ0):
    for j in range(0, VXGNY0):
        BC0.append([0, j, i])

# test data 1
VXGPATH1 = 'things/beam0_64.vxg'
VXGNZ1 = 10
VXGNY1 = 10
VXGNX1 = 64
LOAD1 = {'points': [[VXGNX1-1, 0, VXGNZ1/2]], 'value': [0.0, -1.0, 0.0]}
BC1 = []
for i in range(0, VXGNZ1):
    for j in range(0, VXGNY1):
        BC1.append([0, j, i])

# test data 2
VXGPATH2 = 'things/beam0_32.vxg'
MESHPATH2 = 'things/beam0.stl'
VXGNZ2 = 5
VXGNY2 = 5
VXGNX2 = 32
LOAD2 = {'points': [[VXGNX2-1, 0, VXGNZ2/2]], 'value': [0.0, -1.0, 0.0]}
BC2 = []
for i in range(0, VXGNZ2):
    for j in range(0, VXGNY2):
        BC2.append([0, j, i])

# test data 3
MESHPATH3 = 'things/screw_driver_s.stl'
