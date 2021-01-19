function validateName(name) {
    let nameNoSpace = name.trim();
    console.log(nameNoSpace)
    nameNoSpace = nameNoSpace === "" ? 'Unammed' : nameNoSpace;
    localStorage.removeItem('name');
    localStorage.setItem('name', nameNoSpace);
    return nameNoSpace;
}

module.exports = { validateName };