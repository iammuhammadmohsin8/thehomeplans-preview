// Metres. This single model drives both the drawing and the built geometry.
export const VILLA = {
  footprint: [[-9,-6],[9,-6],[9,1],[-2,1],[-2,6],[-9,6]],
  slabs: [[0,-2.5,18,7],[-5.5,3.5,7,5]],
  rooms: [
    {name:'PRIMARY SUITE',x:-5.5,z:-3},
    {name:'GUEST SUITE',x:-5.5,z:3.3},
    {name:'KITCHEN / DINING',x:3.5,z:-4.2},
    {name:'LIVING',x:3.5,z:-.7},
    {name:'SUN TERRACE',x:3.5,z:4},
    {name:'POOL',x:4,z:8.1},
  ],
  // Every exterior wall opening has matching glass in plan and 3D.
  walls: [
    {a:[-9,-6],b:[9,-6],open:[{from:2,to:5,sill:1.1,top:2.7},{from:11,to:16,sill:1.2,top:2.7}]},
    {a:[-9,-6],b:[-9,6],open:[{from:1.4,to:4.6,sill:.6,top:2.8},{from:7.3,to:10.5,sill:.6,top:2.8}]},
    {a:[-9,6],b:[-2,6],open:[{from:1,to:6,sill:0,top:2.9}]},
    {a:[9,-6],b:[9,1],open:[{from:1.1,to:6.5,sill:0,top:2.9}]},
    {a:[-2,1],b:[9,1],open:[{from:.4,to:10.6,sill:0,top:2.9}]},
    {a:[-2,1],b:[-2,6],open:[{from:.5,to:4.5,sill:0,top:2.9}]},
    {a:[-9,0],b:[-2,0],open:[],interior:true},
    {a:[-2,-6],b:[-2,1],open:[{from:4.4,to:5.6,sill:0,top:2.4,door:true}],interior:true},
  ],
  roofs: [[0,-2.5,18.7,7.7],[-5.5,3.5,7.7,5.7]],
  pool:{x:4,z:8.1,w:8,d:3},
};
