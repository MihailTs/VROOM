import tkinter as tk
import tkinter.ttk as ttk
from ttkthemes import ThemedTk

def on_button_click():
    print("Button clicked!")



root = ThemedTk()
root.title("Rover Controller");

tk.Grid.rowconfigure(root, 0, weight=1)
tk.Grid.columnconfigure(root, 0, weight=1)
tk.Grid.rowconfigure(root, 1, weight=1)
tk.Grid.columnconfigure(root, 1, weight=1)
tk.Grid.columnconfigure(root, 2, weight=1)

forward = tk.Button(root, text="^", command=on_button_click)
forward.grid(column=1, row = 0, sticky="nsew")

left = tk.Button(root, text="<-", command=on_button_click)
left.grid(column =0, row=1, sticky="nsew" )

back = tk.Button(root, text="v", command=on_button_click)
back.grid(column=1, row=1, sticky="nsew")

right = tk.Button(root, text="->", command=on_button_click)
right.grid(column=2, row=1, sticky="nsew")

s = ttk.Style()
print(s.theme_names())
s.theme_use('black')
s.theme_use()

root.bind("<Up>", lambda e: on_button_click())
root.bind("<Left>", lambda e : on_button_click())
root.bind("<Down>", lambda e : on_button_click())
root.bind("<Right>", lambda e : on_button_click())
root.bind("<Escape>", lambda e : root.quit())

root.mainloop()
