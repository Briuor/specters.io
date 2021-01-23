function validateName(name) {
    let nameNoSpace = name.trim();
    console.log(nameNoSpace)
    nameNoSpace = nameNoSpace === "" ? 'Unammed' : nameNoSpace;
    localStorage.removeItem('name');
    localStorage.setItem('name', nameNoSpace);
    return nameNoSpace;
}

// var letters = /^[A-Za-z]+$/;
//       if(inputtxt.value.match(letters))

module.exports = { validateName };