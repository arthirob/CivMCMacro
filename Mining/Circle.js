const p = Player.getPlayer() ;
KeyBind.keyBind("key.attack", true);

function circle(dir) {
    for (let i =0;i<100;i++) {
        p.lookAt(dir+10*Math.sin(2*Math.PI*i/100),20*Math.cos(2*Math.PI*i/100))
        Time.sleep(8);
    }

}

dirCor = (Math.floor((p.getYaw()+22.5)/45))*45;
for (let i=0;i<50;i++) {
    circle(dirCor);
}
