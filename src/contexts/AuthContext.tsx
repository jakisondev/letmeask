import { createContext, ReactNode, useEffect, useState } from "react";

import { firebase, auth } from '../services/firebase';

export type User = {
    id: string;
    name: string;
    avatarURL: string;
}

export type AuthContextType = {
    user: User | undefined;
    signInWithGoogle: () => Promise<void>;
}

export type AuthContextProviderProps = {
    children: ReactNode
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthContextProvider(props: AuthContextProviderProps) {

    const [user, setUser] = useState<User>();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                const { displayName, photoURL, uid } = user;

                if (!displayName || !photoURL) {
                    throw new Error('MIssing information from Google Account.');
                }

                setUser({
                    id: uid,
                    name: displayName,
                    avatarURL: photoURL
                });
            }
        });

        return () => {
            unsubscribe();
        }

    }, []);

    async function signInWithGoogle() {
        const provider = new firebase.auth.GoogleAuthProvider();

        const result = await auth.signInWithPopup(provider);

        if (result.user) {
            const { displayName, photoURL, uid } = result.user;

            if (!displayName || !photoURL) {
                throw new Error('MIssing information from Google Account.');
            }

            setUser({
                id: uid,
                name: displayName,
                avatarURL: photoURL
            });
        }
    }

    return (
        <AuthContext.Provider value={{ user, signInWithGoogle }}>
            {props.children}
        </AuthContext.Provider>
    );
}