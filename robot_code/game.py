import pygame
import sys

pygame.init()

screen = pygame.display.set_mode((640, 480),flags=pygame.RESIZABLE, vsync=True)
pygame.display.set_caption("Hello World")
dt = 0
clock = pygame.time.Clock()
FPS = 60

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

    def keydown(self, key):
        if key == pygame.K_UP:
            self.move_straight()
        if key == pygame.K_DOWN:
            self.move_reverse()

    def keyup(self, key):
        if key == pygame.K_UP or key == pygame.K_DOWN:
            self.stop()

vroom = VroomPrediction()

while True:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_q:
                pygame.quit()
                sys.exit()
            vroom.keydown(event.key)
        if event.type == pygame.KEYUP:
            vroom.keyup(event.key)
        delayqueue.push(event)
    screen.fill((255, 255, 255))

    vroom.update()
    screen.blit(vroom.image, vroom.rect)

    dt = clock.tick(FPS) / 1000
    pygame.display.update()
    pygame.display.flip()



