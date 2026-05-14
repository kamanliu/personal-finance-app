import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const handleLogin = async () => {

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { alert(error.message) }
        else {
            console.log("Logged in: ", data.user?.email)
        }

    }
    return (
        <SafeAreaView>
            <TextInput
                placeholder="Email"
                value={email}
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={text => setEmail(text)}
            />
            <TextInput
                placeholder="Password"
                value={password}
                secureTextEntry={true}
                onChangeText={text => setPassword(text)}
            />
            <TouchableOpacity onPress={() => handleLogin()}><Text>Login</Text></TouchableOpacity>

        </SafeAreaView>
    );
}
