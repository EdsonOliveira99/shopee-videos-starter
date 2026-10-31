import sys,os,glob,subprocess
from PIL import Image,ImageDraw
d=sys.argv[1]; out=sys.argv[2]
ims=[]
for f in sorted(glob.glob(d+'/foto*.jpg'),key=lambda x:int(''.join(c for c in os.path.basename(x) if c.isdigit()) or 0))+sorted(glob.glob(d+'/cor-*.jpg')):
    ims.append((os.path.basename(f),Image.open(f).convert('RGB')))
v=d+'/video.mp4'
if os.path.exists(v):
    dur=float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',v],capture_output=True,text=True).stdout or 0)
    for k in range(8):
        t=dur*(k+0.5)/8; fn=f'/tmp/fr{k}.jpg'
        subprocess.run(['ffmpeg','-y','-v','error','-ss',str(t),'-i',v,'-frames:v','1',fn])
        if os.path.exists(fn): ims.append((f'v{t:.1f}s',Image.open(fn).convert('RGB')))
W=220;cols=8;rows=(len(ims)+cols-1)//cols
s=Image.new('RGB',(cols*W,rows*(W+18)),'white');dr=ImageDraw.Draw(s)
for i,(n,im) in enumerate(ims):
    im.thumbnail((W,W));x=(i%cols)*W;y=(i//cols)*(W+18);s.paste(im,(x,y));dr.text((x+3,y+W+2),n,fill='black')
s.save(out,quality=80)
