import React from "react";
import "./AboutPage.css";

function AboutPage() {
  return (
    <div className="about-container">
      <div className="about-content">

        <div className="about-tag">Our Mission</div>

        <h1 className="about-title">
          Real Learning.<br />
          <span className="about-title-accent">Not Copy-Paste.</span>
        </h1>

        <p className="about-lead">
          RootedTeach AI was built to bring integrity back to coding education.
        </p>

        <div className="about-divider" />

        <div className="about-body">
          <p>
            As AI tools become more powerful, students are increasingly tempted to copy and paste
            generated code without truly understanding it. This shortcut might get assignments done
            but it leaves critical thinking, problem-solving, and real programming skills behind.
          </p>
          <p>
            RootedTeach AI gives teachers the tools to detect AI-assisted submissions and foster
            genuine learning in their classrooms. We believe every student deserves the opportunity
            to truly master the craft of coding not just the appearance of it.
          </p>
          <p>
            Our platform is built for educators who care about the future of their students, and for
            students who want to grow into real engineers.
          </p>
        </div>

        <div className="about-stats">
          <div className="about-stat">
            <span className="stat-number">100%</span>
            <span className="stat-label">Student focused</span>
          </div>
          <div className="about-stat">
            <span className="stat-number">AI</span>
            <span className="stat-label">Detection built-in</span>
          </div>
          <div className="about-stat">
            <span className="stat-number">CS35L</span>
            <span className="stat-label">UCLA Winter 2026</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AboutPage;