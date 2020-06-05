function face()
{
                                        //All numbers in JavaScript are doubles:
                                        //stored as 64-bit IEEE-754 doubles.
    this.Id = 0;                        //integer
    this.X = 0;                         //double
    this.Y = 0;                         //double
    this.Width = 0.0;                   //double
    this.Height = 0.0;                  //double
    this.Gender = "";                   //string
    this.Age = "";                      //string
    this.AgeRange = "";                 //string
    this.DwellTime = 0.0;               //double
    this.FaceSize = 0;                  //integer
    this.MainEmotion = "";              //string
    this.MainEmotionConfidence = 0.0;   //double
    this.EmotionConfidence = {          //double
        "Angry":    0.0,
        "Happy":    0.0,
        "Neutral":  0.0,
        "Sad":      0.0,
        "Surprised":0.0

    };
    this.HeadPoseEstimation = {         //double
        "Pitch":    0.0,
        "Yaw":      0.0,
        "Roll":     0.0
    };
    //pitch, double
    //yaw, double
    //roll, double

}