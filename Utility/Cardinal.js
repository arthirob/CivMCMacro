const p = Player.getPlayer();
dir=p.getYaw();
dirCor = (Math.floor((dir+22.5)/45))*45;
p.lookAt(dirCor,p.getPitch())
