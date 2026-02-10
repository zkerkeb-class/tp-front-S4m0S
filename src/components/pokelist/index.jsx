import { useState, useEffect } from "react";
import PokeCard from "../pokeCard";
import NavButton from "./NavButton";
import './index.css';

const PokeList = () => {
    const [pokemons, setPokemons] = useState([]);
    const [loading, setLoading] = useState(true);

    const [offset, setOffset] = useState(0);
    const [nextId, setNextId] = useState(0);

    const [previousId, setPreviousId] = useState(0);

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState(null);

    const [limit, setLimit] = useState(20)

    const [image, setImage] = useState()

    const [popUpOpen, setPopUpOpen] = useState(false);
    const defaultPokemon = {
        name: { french: "", english: "" },
        type: "",
        base: { HP: 0, Attack: 0, Defense: 0, SpecialAttack: 0, SpecialDefense: 0, Speed: 0 }
    };
    const [newPokemon, setNewPokemon] = useState(defaultPokemon);

    const handleChange = (field, value) => {
        if (field === "french" || field === "english") {
            setNewPokemon(prev => ({ ...prev, name: { ...prev.name, [field]: value } }));
        } else if (field === "type" || field === "image") {
            setNewPokemon(prev => ({ ...prev, [field]: value }));
        } else {
            setNewPokemon(prev => ({ ...prev, base: { ...prev.base, [field]: Number(value) } }));
        }
    };



    const searchPokemon = async (query) => {
        setSearchQuery(query);
        if (query.trim() === "") {
            setSearchResults(null);
            return;
        }
        try {
            const response = await fetch(`http://localhost:3000/pokemons/search?name=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error("Network response was not ok");
            const data = await response.json();
            setSearchResults(Array.isArray(data) ? data : data.data);
        } catch (error) {
            console.error(error);
        }
    };

    const createPokemon = async () => {
        try {
          const formData = new FormData();
            
          formData.append("nameFrench", newPokemon.name.french);
          formData.append("nameEnglish", newPokemon.name.english);
          formData.append(
            "type",
            JSON.stringify(
              newPokemon.type.split(",").map(t => t.trim()).filter(Boolean)
            )
          );
          formData.append("base", JSON.stringify(newPokemon.base));
   
          if (image) {
            formData.append("file", image);
          }
   
          const response = await fetch("http://localhost:3000/pokemons", {
            method: "POST",
            body: formData,
          });
   
          if (!response.ok) throw new Error("Network response was not ok");
   
          const created = await response.json();
          setPokemons(prev => [...prev, created]);
          setPopUpOpen(false);
          setNewPokemon(defaultPokemon);
          setImage(undefined);
        } catch (error) {
          console.error(error);
        }
      };

    useEffect(() => {
        fetch(`http://localhost:3000/pokemons?offset=${offset}&limit=${limit}`)
            .then((response) => response.json())
            .then((data) => {
                console.log("Données reçues:", data);
                setPokemons(data.data);
                setNextId(data.pagination.nextId);
                setPreviousId(data.pagination.previousId)
                setLoading(false);
            })
            .catch((error) => {
                console.error("Erreur:", error);
                setLoading(false);
            });
    }, [offset, limit]);

    if (loading) {
        return <p>Chargement...</p>
    }

    const displayedPokemons = searchResults !== null ? searchResults : pokemons;

    return (
        <div className="poke-list-container">

            {popUpOpen && (
                <>
                    <div className="popup-overlay" onClick={() => setPopUpOpen(false)} />
                    <div className="popup">
                        <h3 className="popup-title">Nouveau Pokémon</h3>
                        <div className="popup-form">
                            <input placeholder="Nom français" value={newPokemon.name.french} onChange={(e) => handleChange("french", e.target.value)} />
                            <input placeholder="Nom anglais" value={newPokemon.name.english} onChange={(e) => handleChange("english", e.target.value)} />
                            <input placeholder="Types (ex: Fire, Water)" value={newPokemon.type} onChange={(e) => handleChange("type", e.target.value)} />
                            <input type="file" id="file" onChange={(e) => setImage(e.target.files[0])} name="file" accept="image/*"/>
                            {Object.keys(newPokemon.base).map((stat) => (
                                <div key={stat} className="popup-stat-row">
                                    <label>{stat}</label>
                                    <input type="number" value={newPokemon.base[stat]} onChange={(e) => handleChange(stat, e.target.value)} />
                                </div>
                            ))}
                        </div>
                        <div className="popup-actions">
                            <button className="btn-cancel" onClick={() => setPopUpOpen(false)}>Annuler</button>
                            <button className="btn-create" onClick={createPokemon}>Créer</button>
                        </div>
                    </div>
                </>
            )}

            <h2>Liste des Pokémon</h2>

            <div className="toolbar">
                <input
                    className="search-bar"
                    placeholder="Rechercher un Pokémon..."
                    value={searchQuery}
                    onChange={(e) => searchPokemon(e.target.value)}
                />

                <select name="limit-selector" defaultValue={20} onChange={(e) => setLimit(Number(e.target.value))}>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                    <option value={40}>40</option>
                </select>
                <button className="btn-add" onClick={() => setPopUpOpen(true)}>+ Ajouter</button>
            </div>

            <ul className={`poke-list ${popUpOpen ? "blur" : ""}`}>
                {displayedPokemons.map((pokemon, index) => (
                    <PokeCard key={index} pokemon={pokemon} />
                ))}
            </ul>

            {searchResults === null && (
                <div className="pagination">
                    <NavButton nextId={previousId} setOffset={setOffset}>
                        Previous Page
                    </NavButton>
                    <NavButton nextId={nextId} setOffset={setOffset}>
                        Next Page
                    </NavButton>
                </div>
            )}
        </div>
    );
};

export default PokeList;
