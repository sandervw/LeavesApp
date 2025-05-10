let currentUser = null;
let setUserFn = () => {};

export function setUserSetter(fn) {
  setUserFn = fn;
}

export function getUser() {
  return currentUser;
}

export function setUser(user) {
  currentUser = user;
  setUserSetter(user); // triggers React state update
}
