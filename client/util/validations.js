function validateName(name) {
    let nameNoSpace = name.trim();
    nameNoSpace = nameNoSpace === "" ? 'Unammed' : nameNoSpace;
    localStorage.removeItem('name');
    localStorage.setItem('name', nameNoSpace);
    return nameNoSpace;
}

module.exports = { validateName };