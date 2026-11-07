try {
  localStorage.clear()
} catch {
  // Storage can be blocked, and there is then nothing to clear.
}

try {
  void indexedDB.databases?.().then((databases) => databases.forEach(({ name }) => name && indexedDB.deleteDatabase(name)))
} catch {
  // Same as above.
}
