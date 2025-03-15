import nxt.locator
from nxt.motcont import *
from nxt.motor import *

class VROOMController:
    def __init__(self, brick):
        self._brick = brick
        self._left_motor = brick.get_motor(Port.C)
        self._right_motor = brick.get_motor(Port.B)

    def move_straight(self):
        self._left_motor.run(power=-30, regulated=True)
        self._right_motor.run(power=-30, regulated=True)

    def move_reverse(self):
        self._left_motor.run(power=30, regulated=True)
        self._right_motor.run(power=30, regulated=True)

    def move_left(self):
        self._right_motor.run(power=60, regulated=True)
        self._left_motor.brake()

    def move_right(self):
        self._left_motor.run(power=60, regulated=True)
        self._right_motor.brake()

    def stop(self):
        self._left_motor.brake()
        self._right_motor.brake()