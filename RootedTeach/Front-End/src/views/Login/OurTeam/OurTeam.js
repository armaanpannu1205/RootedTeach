import "./OurTeam.css";
import Card from "./Card";
import { Images } from "../../../assets/Images.js";

function OurTeam() {
  return (
    <div className="container">
      <div className="our-team-page">
      <h1>Our Team:</h1>

      <div className="card-container">
        <Card
          image={Images.IntroArman.src}
          name="Arman Pannu"
          role="Lead Developer"
          about="Hi! My name is Arman and I am a 3rd year UCLA student, majoring in Linguistics and Computer Science. In my free time I like to go to the gym, vibecode and hang out with friends!"
        />
        <Card
          image={Images.IntroArman.src}
          name="Arman Pannu"
          role="Lead Developer"
          about="Hi guys! My name is Arman and I am a 3rd year UCLA student, majoring in Linguistics and Computer Science. In my free time I like to go to the gym, vibecode and hang out with friends!"
        />
         <Card
          image={Images.IntroArman.src}
          name="Arman Pannu"
          role="Lead Developer"
          about="Hi guys! My name is Arman and I am a 3rd year UCLA student, majoring in Linguistics and Computer Science. In my free time I like to go to the gym, vibecode and hang out with friends!"
        />
         <Card
          image={Images.IntroArman.src}
          name="Arman Pannu"
          role="Lead Developer"
          about="Hi guys! My name is Arman and I am a 3rd year UCLA student, majoring in Linguistics and Computer Science. In my free time I like to go to the gym, vibecode and hang out with friends!"
        />
         <Card
          image={Images.IntroArman.src}
          name="Arman Pannu"
          role="Lead Developer"
          about="Hi guys! My name is Arman and I am a 3rd year UCLA student, majoring in Linguistics and Computer Science. In my free time I like to go to the gym, vibecode and hang out with friends!"
        />
      </div>
    </div>
    </div>
  );
}

export default OurTeam;
