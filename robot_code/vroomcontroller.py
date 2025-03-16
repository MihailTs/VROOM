import nxt.locator
from nxt.motcont import *
from nxt.motor import *
from nxt.sensor import *
import threading
from nxt.sensor.generic import Ultrasonic
import time

class VROOMController:
    def __init__(self, brick):
        self._brick = brick
        self._left_motor = brick.get_motor(nxt.motor.Port.C)
        self._right_motor = brick.get_motor(nxt.motor.Port.B)
        self._ultrasonic = Ultrasonic(brick, nxt.sensor.Port.S4)
        self._obstacle_detected_listeners = []

    def check_ultrasound(self):
        while True:
            if self._ultrasonic.get_distance() <= 20:
                self.stop()
                self._notify_obstacle_detected(True)
                break

    def _notify_obstacle_detected(self, flag = True):
        for callback in self._obstacle_detected_listeners:
            callback(flag)

    def add_obstacle_detected_listener(self, callback):
        self._obstacle_detected_listeners.append(callback)

    def move_straight(self):
        if self._ultrasonic.get_distance() <= 20:
            self._notify_obstacle_detected()
            return
        print(self._ultrasonic.get_distance())
        self._left_motor.run(power=-30, regulated=True)
        self._right_motor.run(power=-30, regulated=True)
        my_thread = threading.Thread(target=self.check_ultrasound)
        my_thread.start()

    def move_reverse(self):
        self._left_motor.run(power=30, regulated=True)
        self._right_motor.run(power=30, regulated=True)
        self._notify_obstacle_detected(False)

    def move_left(self):
        self._right_motor.run(power=-30, regulated=True)
        self._left_motor.run(power=30, regulated=True)

    def move_right(self):
        self._left_motor.run(power=-30, regulated=True)
        self._right_motor.run(power=30, regulated=True)

    def stop(self):
        self._left_motor.brake()
        self._right_motor.brake()