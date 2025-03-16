import pygame
import sys

pygame.init()

screen = pygame.display.set_mode((640, 480),flags=pygame.RESIZABLE, vsync=True)
pygame.display.set_caption("Hello World")
dt = 0
clock = pygame.time.Clock()
FPS = 60

<<<<<<< HEAD
=======
delayQueue = []


>>>>>>> 4bf8641dc3ffb2350ae62d63b8caad6529206d64
class VroomPrediction (pygame.sprite.Sprite):
    def __init__(self):
        super(VroomPrediction, self).__init__()
        self.image = pygame.image.load("vroom.png").convert_alpha()
        self.image = pygame.transform.scale(self.image, (32, 32))
        self.rect = self.image.get_rect()
        self.position = pygame.math.Vector2(320, 240)
        self.velocity = pygame.math.Vector2(0, 0)
    
    def update(self):
        self.position += self.velocity * dt
        self.rect.update(self.position.x, self.position.y, 32, 32)
    
    def move_straight(self):
        self.velocity = pygame.math.Vector2(0, -100)

    def move_reverse(self):
        self.velocity = pygame.math.Vector2(0, 100)

    def stop(self):
        self.velocity = pygame.math.Vector2(0, 0)

    def key(self, event):
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_UP:
                self.move_straight();
            if event.key == pygame.K_DOWN:
                self.move_reverse();
        if event.type == pygame.KEYUP:
            if event.key == pygame.K_UP or event.key == pygame.K_DOWN:
                self.stop()

vroom = VroomPrediction()
real_vroom = VroomPrediction()

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
<<<<<<< HEAD
            vroom.keydown(event.key)
        if event.type == pygame.KEYUP:
            vroom.keyup(event.key)
        delayqueue.push(event)
=======
        vroom.key(event)
        delayQueue.append([event, current_time + 2000])
    while(delayQueue and delayQueue[0][1] <= current_time):
        event = delayQueue.pop(0)[0]
        real_vroom.key(event)
    
>>>>>>> 4bf8641dc3ffb2350ae62d63b8caad6529206d64
    screen.fill((255, 255, 255))

    vroom.update()
    real_vroom.update()
    screen.blit(vroom.image, vroom.rect)
    screen.blit(real_vroom.image, real_vroom.rect)

    dt = clock.tick(FPS) / 1000
    pygame.display.update()
    pygame.display.flip()



