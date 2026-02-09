import { useState } from 'react';
import {Link, useNavigate, useParams} from 'react-router';
import usePokemon from '../hook/usePokemon';
import './pokemonDetails.css'

const PokemonDetails = () => {
    const {id} = useParams();
    const [popUpOpen, setPopUpOpen] = useState(false)
    const [editing, setEditing] = useState(false)
    const [editedBase, setEditedBase] = useState(null)

    const navigate = useNavigate();
    const {pokemonData, loading, error} = usePokemon(id);
    console.log('pokemonData details', pokemonData);


    if (loading) {
        return <p>Chargement des détails du Pokémon...</p>;
    }
    
    const startEditing = () => {
        setEditedBase({...pokemonData.base});
        setEditing(true);
    }

    const handleStatChange = (statName, value) => {
        setEditedBase(prev => ({...prev, [statName]: Number(value)}));
    }

    const saveChanges = async () => {
        try {
            const response = await fetch(`http://localhost:3000/pokemons/${id}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({...pokemonData, base: editedBase})
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            pokemonData.base = editedBase;
            setEditing(false);
        } catch (error) {
            console.error(error);
        }
    }

    const deletePokemon = async () => {
        try {
            const response = await fetch(`http://localhost:3000/pokemons/${id}`, {
                method : "DELETE"
            })
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error(error)
        }
        finally{
            navigate('/');
        }
    }

    return (


        <div className="full-container">

            {
                popUpOpen && (
                    <div className='pop-up-container'>
                        <span className='warning-text'>Vous etes sur le point de supprimer le pokemon {pokemonData.name.french} de la base de donnée. Etes vous bien sur de vouloir faire cette action ?</span>

                        <div className='action-button'>
                            <button className='cancel-button' onClick={() => setPopUpOpen(false)}>Annulez</button>

                            <button className='delete-button' onClick={() => deletePokemon()}>Confirmez</button>
                        </div>
                    </div>
                )
            }

            <button className='back-to-list'>
                <Link to="/">Retour à la liste des Pokémon</Link>
            </button>

            

            <div className={`poke-detail-card-container ${popUpOpen ? 'blur' :''}`}>
                <button onClick={() => setPopUpOpen(true)}>
                    Delete Pokemon
                </button>
                {!editing && (
                    <button onClick={startEditing}>
                        Edit Pokemon
                    </button>
                )}
                <h1>Détails du Pokémon {pokemonData.name.french}</h1>
                <div className="poke">
                    <img src={pokemonData.image} alt="Pokémon" className="poke-image-details" />
                </div>
                <div>
                    {Object.entries(editing ? editedBase : pokemonData?.base).map(([statName,stat]) => {
                        return(
                            <div className="poke-stat-row" key={statName}>
                                <span className={`poke-type-font poke-type-${statName}`}>{statName}</span>

                                {editing ? (
                                    <input
                                        type="number"
                                        value={stat}
                                        onChange={(e) => handleStatChange(statName, e.target.value)}
                                    />
                                ) : (
                                    <span className="poke-type-font poke-stat-value">{stat}</span>
                                )}
                            </div>
                        )
                    })}    

                </div>
                {editing && (
                    <>
                        <button onClick={saveChanges}>
                            Validate Modifications
                        </button>
                        <button onClick={() => setEditing(false)}>
                            Cancel
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PokemonDetails;