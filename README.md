# 3d-modeling
This project is using ThreeJS to build 3D Building Floor Plan models from Floor Blue Print images. It's a one page application powered by AngularJS and Angular Material Design.

***Start***

Simply download the entire project and launch index.html, and the rest will be very self-explanatory.


***How it works***

Basically the user needs to have a Black/Wite png image ready, upload, and render the 3D model. Note, you'd have to have the floor plan ready, and this software will handle the rest.

A couple tricks we are doing here:       
   **Convert png into binary code**   
   **Optimize the binary 2D array with BFS**   
   **Optimize the 3D models with ThreeJS's Geometry merge function**   
   **Render 3D model**   
   **Allow control of the 3D model**   

Note: that we are not making precise 3D models, but just a simulation via pixels of cube models. The better your input png image is, the better the results will be. The definition of good png image is: clear and thick black walls.


***Example***

This is a random floor plan found online, and with the 3D Modeling tool, we can build a 3D prototype model.


Floor Plan:


![](https://github.com/shawnfan/3d-modeling/blob/master/Early%20Prototype/1st%20selector/resource/round-floor-plan.png)

Outcome:


![](https://github.com/shawnfan/3d-modeling/blob/master/Early%20Prototype/1st%20selector/resource/round.png)




Basically any map (so far I have decide only recognize black color as height) can be prototyped. Another example, I took the campus map of my college and made a model:

Map:


![](https://github.com/shawnfan/3d-modeling/blob/master/Early%20Prototype/1st%20selector/resource/map-floor-plan.png)

Outcome:


![](https://github.com/shawnfan/3d-modeling/blob/master/Early%20Prototype/1st%20selector/resource/map.png)



