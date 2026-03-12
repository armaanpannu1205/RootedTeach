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
          role="Lead Operations Developer"
          about="Hi! My name is Arman and I am a 3rd year UCLA student, majoring in Linguistics and Computer Science. In my free time I like to go to the gym, vibecode and hang out with friends!"
        />
         <Card
          image={Images.IntroShogo.src}
          name="Shogo Toiyama"
          role="Co-Lead Developer"
          about="Hi guys! My name is Shogo and I am a 3rd year UCLA student, majoring in Computer Science. I’ve always loved creating things and I love the digital world is its infinite potential"
        />
         <Card
          image={Images.IntroJuenn.src}
          name="Juenn Kang"
          role="Front-End Developer"
          about="Hi, My name is Jueun and I am a 3rd year at UCLA, majoring in Linguistics and Computer Science. My favorite things are taking photos, listening to music, playing the guitar, and going to the beach!"
        />
         <Card
          image={Images.IntroRica.src}
          name="Rica Kotani"
          role="Front-End Developer"
          about="Hello! My name is Rica and I am a 3rd year at UCLA, majoring in Linguistics and Computer Science. In my free time I like going to concerts, cute cafes & restaurants, and doing my nails!"
        />
        <Card
          image={Images.IntroShige.src}
          name="Shigehiro Harada"
          role="Back-End Developer"
          about="Hello! My name is Shige and I am a 3rd year at UCLA, majoring in Linguistics and Computer Science. In my free time I like playing video gaems, go to the gym."
        />
      </div>
    </div>
    </div>
  );
} 

export default OurTeam;  
