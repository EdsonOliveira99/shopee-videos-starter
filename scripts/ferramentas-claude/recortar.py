import sys
from rembg import remove, new_session
from PIL import Image
import numpy as np
from scipy import ndimage
import os
FR=float(os.environ.get("FR","0.15"))
sess=new_session('isnet-general-use')
for a in sys.argv[1:]:
    src,dst=a.split('=')
    im=Image.open(src).convert('RGB')
    out=remove(im,session=sess)
    arr=np.array(out); al=arr[:,:,3]
    lab,n=ndimage.label(al>40)
    if n>1:
        sizes=ndimage.sum(np.ones_like(al),lab,range(1,n+1)); keep=np.argmax(sizes)+1
        # mantém componentes grandes (>15% do maior)
        big=[i+1 for i,s in enumerate(sizes) if s>=FR*sizes.max()]
        mask=np.isin(lab,big); arr[:,:,3]=np.where(mask,al,0)
    o=Image.fromarray(arr); bb=o.getbbox(); o=o.crop(bb); o.save(dst); print(dst,o.size)
