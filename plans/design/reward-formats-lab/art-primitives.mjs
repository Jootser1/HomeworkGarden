// Authoring vocabulary only: shared materials and garden objects, not a creature generator.
export const ink='#41554F', cream='#F2E5C8', sand='#C9AE83', stone='#A7B5AA', green='#6B956F', light='#ADC796', dark='#476D5C', rose='#C88789', coral='#DEAB93', blue='#87B7BC', pale='#CEE2DA', gold='#D9B875', bark='#92765E', plum='#9D8CA9', white='#FFF9EA'
export const palette=[ink,cream,sand,stone,green,light,dark,rose,coral,blue,pale,gold,bark,plum,white]
export const P=(d,fill=green,stroke=ink,w=2)=>({tag:'path',attrs:{d,fill,stroke,'stroke-width':w,'stroke-linejoin':'round'}})
export const L=(d,stroke=ink,w=3)=>P(d,'none',stroke,w)
export const E=(cx,cy,rx,ry,fill=cream,stroke=ink,w=2)=>({tag:'ellipse',attrs:{cx,cy,rx,ry,fill,stroke,'stroke-width':w}})
export const C=(cx,cy,r,fill=gold,stroke=ink,w=2)=>({tag:'circle',attrs:{cx,cy,r,fill,stroke,'stroke-width':w}})
export const R=(x,y,width,height,fill=cream,rx=3)=>({tag:'rect',attrs:{x,y,width,height,rx,fill,stroke:ink,'stroke-width':2}})
const slug=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
export const g=(label,...shapes)=>({id:slug(label),label,shapes:shapes.flat()})
export const move=(part,motion='sway')=>({...part,motion})
export function drawing(id,name,format,parts,description,kind='decor') { if(parts.length!==format)throw Error(`${id}: ${parts.length} instead of ${format}`);return {id,name,format,kind,palette,description,parts} }
export const bloom=(x,y,s=1,color=rose)=>[P(`M${x} ${y}Q${x-20*s} ${y-8*s} ${x-10*s} ${y-21*s}Q${x} ${y-27*s} ${x+7*s} ${y-17*s}Q${x+24*s} ${y-22*s} ${x+23*s} ${y-7*s}Q${x+22*s} ${y+10*s} ${x+8*s} ${y+7*s}Q${x-3*s} ${y+18*s} ${x-10*s} ${y+7*s}Q${x-25*s} ${y+8*s} ${x-20*s} ${y-5*s}Z`,color),C(x+2*s,y-5*s,5*s,gold)]
export const leaves=(x,y,s=1)=>[L(`M${x} ${y}L${x} ${y-40*s}`,dark,3),P(`M${x} ${y-15*s}Q${x-30*s} ${y-20*s} ${x-24*s} ${y-37*s}Q${x-4*s} ${y-37*s} ${x} ${y-15*s}M${x} ${y-25*s}Q${x+14*s} ${y-54*s} ${x+29*s} ${y-45*s}Q${x+30*s} ${y-25*s} ${x} ${y-25*s}Z`,green)]
export const pot=(x,y,s=1)=>[P(`M${x-17*s} ${y-23*s}L${x+17*s} ${y-23*s}L${x+12*s} ${y}L${x-12*s} ${y}Z`,coral),E(x,y-23*s,17*s,5*s,sand)]
export const fern=(x,y,s=1)=>[...leaves(x,y,s),P(`M${x} ${y-6*s}Q${x-29*s} ${y-8*s} ${x-23*s} ${y-23*s}Q${x-7*s} ${y-25*s} ${x} ${y-6*s}M${x} ${y-11*s}Q${x+20*s} ${y-34*s} ${x+30*s} ${y-20*s}Q${x+29*s} ${y-8*s} ${x} ${y-11*s}Z`,light)]
export const rock=(x,y,s=1)=>[P(`M${x-25*s} ${y}L${x-18*s} ${y-26*s}L${x+5*s} ${y-37*s}L${x+25*s} ${y-12*s}L${x+18*s} ${y+4*s}Z`,stone),L(`M${x-15*s} ${y-24*s}L${x-3*s} ${y-12*s}L${x-5*s} ${y}`,cream,3)]
export const pine=(x,y,s=1)=>[L(`M${x} ${y}L${x} ${y-65*s}`,bark,5),P(`M${x-27*s} ${y-16*s}L${x-15*s} ${y-38*s}L${x-22*s} ${y-38*s}L${x} ${y-79*s}L${x+22*s} ${y-38*s}L${x+15*s} ${y-38*s}L${x+27*s} ${y-16*s}Z`,dark)]
export const mushroom=(x,y,s=1)=>[P(`M${x-6*s} ${y}L${x-5*s} ${y-28*s}L${x+5*s} ${y-28*s}L${x+9*s} ${y}Z`,cream),P(`M${x-27*s} ${y-25*s}Q${x-23*s} ${y-56*s} ${x} ${y-57*s}Q${x+23*s} ${y-55*s} ${x+28*s} ${y-25*s}Q${x} ${y-14*s} ${x-27*s} ${y-25*s}Z`,rose),C(x-10*s,y-34*s,5*s,cream),C(x+11*s,y-39*s,6*s,cream)]
export const lantern=(x,y,s=1)=>[L(`M${x} ${y-40*s}L${x} ${y-32*s}`,bark,3),R(x-11*s,y-31*s,22*s,28*s,gold,5*s),L(`M${x-6*s} ${y-26*s}L${x-6*s} ${y-8*s}M${x+6*s} ${y-26*s}L${x+6*s} ${y-8*s}`,cream,2),P(`M${x-14*s} ${y-31*s}L${x} ${y-40*s}L${x+14*s} ${y-31*s}Z`,bark)]
export const windowPane=(x,y,s=1)=>[R(x-10*s,y-14*s,20*s,24*s,blue,4*s),L(`M${x} ${y-12*s}L${x} ${y+8*s}M${x-8*s} ${y-2*s}L${x+8*s} ${y-2*s}`,cream,2)]
export const steps=(x,y,s=1)=>[P(`M${x-23*s} ${y}L${x-23*s} ${y-7*s}L${x-16*s} ${y-7*s}L${x-16*s} ${y-14*s}L${x+16*s} ${y-14*s}L${x+16*s} ${y-7*s}L${x+23*s} ${y-7*s}L${x+23*s} ${y}Z`,sand),L(`M${x-14*s} ${y-7*s}L${x+14*s} ${y-7*s}`,cream,2)]
export const pennant=(x,y,s=1)=>[L(`M${x} ${y}L${x} ${y-48*s}`,bark,3),P(`M${x} ${y-48*s}L${x+29*s} ${y-38*s}L${x} ${y-27*s}Z`,coral)]
export const firefly=(x,y,s=1)=>[E(x,y,8*s,10*s,gold,'none',0),E(x-6*s,y-4*s,7*s,4*s,pale),E(x+6*s,y-4*s,7*s,4*s,pale),E(x,y+2*s,4*s,8*s,gold),C(x,y-6*s,3*s,ink)]
export const eyes=(x,y,s=1)=>[E(x-15*s,y,5*s,7*s,ink),E(x+15*s,y,5*s,7*s,ink),C(x-14*s,y-2*s,1.7*s,white,white),C(x+16*s,y-2*s,1.7*s,white,white)]
