import pygame
import sys
from math import *
import nxt.locator
from vroomcontroller import VROOMController

cameraPos = pygame.math.Vector2(0, 0)

class VroomPrediction (pygame.sprite.Sprite):
    def __init__(self, color = (255, 0, 0)):
        super(VroomPrediction, self).__init__()
        self.image = pygame.Surface((64, 64), pygame.SRCALPHA)
        pygame.draw.polygon(self.image, color, [(0, 64), (64, 64), (32, 0)])
        self.original_image = self.image
        self.position = pygame.math.Vector2(500, 540)
        self.rect = self.image.get_rect(topleft=self.position)
        self.rotation = 0
        self.w = 0
        self.velocity = pygame.math.Vector2(0, 0)
        self.is_obstacle_detected = False
    
    def update(self):
        self.position += self.velocity * dt
        self.rotation += self.w * dt
        self.image = pygame.transform.rotate(self.original_image, self.rotation)
        self.rect = self.image.get_rect(center=self.position - cameraPos)
    
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
        self.velocity = pygame.math.Vector2(0, 0)
        self.w = 0

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
                self.stop()
            if event.key == pygame.K_LEFT or event.key == pygame.K_RIGHT:
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

    def on_obstacle_detected(self, flag):
        self.is_obstacle_detected = flag


ground_color = (20, 40, 30);

class Ground(pygame.sprite.Sprite):
    def __init__(self):
        super(Ground, self).__init__()
        self.image = pygame.Surface((1000, 1000))
        self.image.fill((255, 255, 255))
        self.position = pygame.math.Vector2(250, 700)
        size = 100;
        for i in range(0, 11):
            for j in range(0, 4):
                pygame.draw.rect(self.image, ground_color, (i * size, j * size, size * .95, size * .95), width=0)
        pygame.draw.circle(self.image, (255, 0, 0), (500, 300), 20)
        pygame.draw.circle(self.image, (255, 0, 0), (200, 100), 20)

        self.rect = self.image.get_rect()
    
    def update(self):
        self.rect = self.image.get_rect(center=self.position - cameraPos)


with nxt.locator.find(host='00:16:53:13:02:ED') as brick:
    vroom_controller = VROOMController(brick)
    pygame.init()
    
    screen = pygame.display.set_mode((640, 480),flags=pygame.RESIZABLE, vsync=True)
    pygame.display.set_caption("VROOM")
    dt = 0
    clock = pygame.time.Clock()
    FPS = 60
    
    speed = 50
    rotationSpeed = 50
    delayQueue = []
    
    vroom = VroomPrediction()
    vroomRP = pygame.sprite.RenderPlain((vroom))
    real_vroom = Vroom(vroom_controller)
    realVroomRP = pygame.sprite.RenderPlain((real_vroom))
    ground = Ground()
    grondRP = pygame.sprite.RenderPlain((ground))
    
    vroom_controller.add_obstacle_detected_listener(real_vroom.on_obstacle_detected)
    
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
            delayQueue.append([event, current_time + 4000])
    
        while(delayQueue and delayQueue[0][1] <= current_time):
            event = delayQueue.pop(0)[0]
            real_vroom.key(event)
        
        screen.fill((255, 255, 255))
    
    
        if real_vroom.is_obstacle_detected:
            delayQueue = []
            real_vroom.is_obstacle_detected = False
            real_vroom.stop()
            vroom.position.update(real_vroom.position) 
            # effect
    
        cameraPos = vroom.position - pygame.math.Vector2(500, 540)
    
        grondRP.update()
        grondRP.draw(screen)
    
        vroomRP.update()
        vroomRP.draw(screen)
    
        realVroomRP.update()
        realVroomRP.draw(screen)
    
        dt = clock.tick(FPS) / 1000
        pygame.display.update()
        pygame.display.flip()
