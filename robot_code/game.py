import pygame
import sys
from math import *
import nxt.locator
from vroomcontroller import VROOMController

class VroomPrediction (pygame.sprite.Sprite):
    def __init__(self):
        super(VroomPrediction, self).__init__()
        self.image = pygame.image.load("vroom.png").convert_alpha()
        self.image = pygame.transform.scale(self.image, (64, 64))
        self.realImage = self.image
        self.rect = self.image.get_rect()
        self.position = pygame.math.Vector2(320, 240)
        self.rotation = 0
        self.w = 0
        self.velocity = pygame.math.Vector2(0, 0)
    
    def update(self):
        self.position += self.velocity * dt
        self.rotation += self.w * dt
        self.realImage = pygame.transform.rotate(self.image, self.rotation)
        self.rect.update(self.position.x, self.position.y, self.rect.width, self.rect.height)
    
    def move_straight(self):
        rotation = self.rotation * pi / 180
        self.velocity = pygame.math.Vector2(
                -speed * sin(rotation), -speed * cos(rotation)
        )

    def move_reverse(self):
        rotation = self.rotation * pi / 180
        self.velocity = pygame.math.Vector2(
                speed * sin(rotation), speed * cos(rotation)
        )
    
    def turn_left(self):
        self.w = rotationSpeed

    def turn_right(self):
        self.w = -rotationSpeed

    def stop(self):
        pass

    def key(self, event):
        if event.type == pygame.KEYDOWN:
            if self.velocity.length() <= 0.01 and abs(self.w) <= 0.01:
                if event.key == pygame.K_UP:
                    self.move_straight()
                if event.key == pygame.K_DOWN:
                    self.move_reverse()
                if event.key == pygame.K_LEFT:
                    self.turn_left()
                if event.key == pygame.K_RIGHT:
                    self.turn_right()
        if event.type == pygame.KEYUP:
            if event.key == pygame.K_UP or event.key == pygame.K_DOWN:
                self.velocity = pygame.math.Vector2(0, 0)
                self.stop()
            if event.key == pygame.K_LEFT or event.key == pygame.K_RIGHT:
                self.w = 0
                self.stop()

class Vroom(VroomPrediction):
    def __init__(self, vroom_controller):
        super().__init__()
        self._vroom_controller = vroom_controller

    def move_straight(self):
        super().move_straight()
        self._vroom_controller.move_straight()

    def move_reverse(self):
        super().move_reverse()
        self._vroom_controller.move_reverse()

    def turn_left(self):
        super().turn_left()
        self._vroom_controller.move_left()

    def turn_right(self):
        super().turn_right()
        self._vroom_controller.move_right()

    def stop(self):
        super().stop()
        self._vroom_controller.stop()

with nxt.locator.find(host='00:16:53:13:02:ED') as brick:
    vroom_controller = VROOMController(brick)
    pygame.init()

    screen = pygame.display.set_mode((640, 480),flags=pygame.RESIZABLE, vsync=True)
    pygame.display.set_caption("Hello World")
    dt = 0
    clock = pygame.time.Clock()
    FPS = 60

    speed = 100
    rotationSpeed = 60
    delayQueue = []

    vroom = VroomPrediction()
    real_vroom = Vroom(vroom_controller)

    while True:
        current_time = pygame.time.get_ticks()
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_q:
                    pygame.quit()
                    sys.exit()
            vroom.key(event)
            delayQueue.append([event, current_time + 2000])

        while(delayQueue and delayQueue[0][1] <= current_time):
            event = delayQueue.pop(0)[0]
            real_vroom.key(event)
        
        screen.fill((255, 255, 255))

        vroom.update()
        real_vroom.update()
        screen.blit(vroom.realImage, vroom.rect)
        screen.blit(real_vroom.realImage, real_vroom.rect)

        dt = clock.tick(FPS) / 1000
        pygame.display.update()
        pygame.display.flip()