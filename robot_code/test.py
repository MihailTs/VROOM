import nxt.locator

with nxt.locator.find() as b:
    print("Found brick:", b.get_device_info()[0])
    #b.play_tone(440, 250)
    mymotor = b.get_motor(nxt.motor.Port.A);
    mymotor.turn(25, 360)

    

