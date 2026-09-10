import { supabase } from "@/lib/supabase";
import { IconSquare } from "@/utils/IconSquare";
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";







export default function Login() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState(false);
    const[showSigning,setShowSigning] = useState(false)

    const handleLogin = async () => {

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { alert(error.message) }
        else {
            console.log("Logged in: ", data.user?.email)
        }
        setShowSigning(false)

    }
    return (
        <LinearGradient
            colors={['#0f1a3e', '#1a56db', '#3730a3']}
            locations={[0, 0.5, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.7, y: 1 }}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'stretch' }}>
                <View style={styles.container}>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <IconSquare
                            iconSet='fontawesomeSix'
                            icon='magnifying-glass-dollar'
                            iconSize={25}
                            iconColor='#002ae4'
                        />
                        <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Track App</Text>
                    </View>
                    <Text style = {{fontWeight:'bold',fontSize:25}}>Welcome Back</Text>

                    <Text>Email address</Text>
                    <View style={styles.inputBox}>
                        <Feather name="mail" size={18} color="#9ca3af" style={styles.icon} />
                        <TextInput
                            placeholder="you@example.com"
                            placeholderTextColor="#9ca3af"
                            value={email}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            onChangeText={text => setEmail(text)}
                            style={styles.input}
                        />
                    </View>
                    <Text>Password</Text>
                    <View style={styles.inputBox}>
                        <TextInput

                            placeholder="••••••••"
                            placeholderTextColor="#9ca3af"
                            value={password}
                            onChangeText={text => setPassword(text)}
                            secureTextEntry={!showPassword}
                            style={styles.input}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>


                    <TouchableOpacity style={styles.saveButton} onPress={() => {handleLogin();setShowSigning(true)}}>
                        <Text style={styles.saveButtonText}> {showSigning ? "Signing In" : "Sign"}</Text>
                    </TouchableOpacity>

                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({

    container: {

        justifyContent: 'center',
        alignItems: 'stretch',
        padding: 20,
          gap:12,
        backgroundColor: 'white',
        borderRadius: 20,
        margin: 20

    },
    inputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        paddingHorizontal: 10,
        height: 48,
        
    },
    icon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#111',
    },

    saveButton: {
        backgroundColor: '#f2f3f7',
        padding: 15,
        borderRadius: 8,
        marginTop: 20,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#6a717f',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 10,
    },

})
//  <LinearGradient
//                 colors={[iconColor, iconColor + '99'] as const}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 1 }}
//                 style={{
//                     height: squareSize,
//                     width: squareSize,
//                     borderRadius: 20,
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                 }}
//             ></LinearGradient>