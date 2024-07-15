const p = Player.getPlayer();
var dir =0;
dir=p.getYaw();
dirCor = (Math.floor((dir+22.5)/45))*45;
p.lookAt(dirCor,0)
