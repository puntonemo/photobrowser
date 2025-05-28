import fs from 'fs';
import path from 'path';

type User = {
    id: string;
    username: string;
    displayName: string;
    credentials: any[];
};

const FILE_PATH = path.resolve(path.dirname(new URL(import.meta.url).pathname), 'users.json');

export function loadUsersFromFile(): Map<string, User> {
    try {
        console.log('LOADING', FILE_PATH);
        const data = fs.readFileSync(FILE_PATH, 'utf-8');
        const obj = JSON.parse(data);
        return new Map<string, User>(Object.entries(obj));
    } catch {
        return new Map();
    }
}

function saveUsersToFile(store: Map<string, User>) {
    const obj = Object.fromEntries(store.entries());
    fs.writeFileSync(FILE_PATH, JSON.stringify(obj, null, 2));
}

export const userStore = loadUsersFromFile();

export function hasUser(username: string): boolean {
    return userStore.has(username);
}
export function getUser(username: string): User | undefined {
    return userStore.get(username);
}

export function getAllUsers(): User[] {
    return Array.from(userStore.values());
}

export function deleteUser(username: string): boolean {
    const deleted = userStore.delete(username);
    saveUsersToFile(userStore);
    return deleted;
}

export function addOrUpdateUser(user: User) {
    userStore.set(user.username, user);
    saveUsersToFile(userStore);
}
