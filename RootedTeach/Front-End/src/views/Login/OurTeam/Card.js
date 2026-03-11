import "./Card.css";

function Card({image, role, name, about}) {
  return (
    <div className="card">
      <img src={image} alt={name} className="card-img"/>
      <h2 className="card-name">{name}</h2>
      <h5 className="card-role">{role}</h5>
      <p className="card-about">{about}</p>
    </div>
  );
}

export default Card;
