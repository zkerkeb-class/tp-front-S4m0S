
const NavButton = ({children, nextId ,setOffset}) => {

    return (
        <>
            <button onClick={() => setOffset(nextId)}>{children}</button>
        </>
    )
}

export default NavButton