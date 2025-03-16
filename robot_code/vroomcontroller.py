import nxt.locator
from nxt.motcont import *
from nxt.motor import *
from nxt.sensor import *
import threading
from nxt.sensor.generic import Ultrasonic

class VROOMController:
    def __init__(self, brick):
        self._brick = brick
        self._left_motor = brick.get_motor(nxt.motor.Port.C)
        self._right_motor = brick.get_motor(nxt.motor.Port.B)
        self._ultrasonic = Ultrasonic(brick, nxt.sensor.Port.S1)
        self._is_in_reverse = False
        my_thread = threading.Thread(target=self.check_ultrasound)
        my_thread.start()

    def check_ultrasound(self):
        while True:
            if self._ultrasonic.get_distance() <= 20 and self._is_in_reverse == False:
                self.stop()

    def move_straight(self):
        self._is_in_reverse = False
        if self._ultrasonic.get_distance() <= 20:
            return
        self._left_motor.run(power=-30, regulated=True)
        self._right_motor.run(power=-30, regulated=True)

    def move_reverse(self):
        self._is_in_reverse = True
        self._left_motor.run(power=30, regulated=True)
        self._right_motor.run(power=30, regulated=True)

    def move_left(self):
        print("here")
        self._is_in_reverse = False
        if self._ultrasonic.get_distance() <= 20:
            return
        self._right_motor.run(power=-30, regulated=True)
        self._left_motor.run(power=30, regulated=True)

    def move_right(self):
        self._is_in_reverse = False
        if self._ultrasonic.get_distance() <= 20:
            return
        self._left_motor.run(power=-30, regulated=True)
        self._right_motor.run(power=30, regulated=True)

    def stop(self):
        self._left_motor.brake()
        self._right_motor.brake()