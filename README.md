# 3d-modeling
This project is using ThreeJS to build 3D Building Floor Plan models from Floor Blue Print images. It's a one page application powered by AngularJS and Angular Material Design.

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


***How it works***

Basically the user needs to have a Black/Wite png image ready, upload, and render the 3D model. Note, you'd have to have the floor plan ready, and this software will handle the rest.

A couple fancy things we are doing here:    
   Convert png into binary code
   Render 3D model based on binary code

Note that we are not making precise 3D models, but just simulating 3D models via pure programming. The better your input png image, the better the results will be.


