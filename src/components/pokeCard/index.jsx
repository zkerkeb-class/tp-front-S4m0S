import { Link } from "react-router";

import './index.css';
import PokeTitle from "./pokeTitle";
import PokeImage from "./pokeImage";

const PokeCard = ({ pokemon }) => {
    
    return (
        <Link to={`/pokemonDetails/${encodeURIComponent(pokemon.id)}`}>
        <div className="poke-card">
            <div className={`poke-card-header poke-type-${pokemon.types?.[0]}`}>
                <PokeTitle name={pokemon.name.french} />
            </div>
            <div className="poke-image-background">
                <PokeImage imageUrl={pokemon.image} />
            </div>
        </div>
        </Link>
    );
}

export default PokeCard;