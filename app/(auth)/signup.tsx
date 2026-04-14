import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KineticTheme } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const router = useRouter();

  const handleSignup = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signup(name, email, password);
      router.replace('/(tabs)/home');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['rgba(216, 115, 255, 0.15)', KineticTheme.colors.surface]} style={styles.gradient} />
      
      <View style={styles.content}>
        <Text style={styles.title}>STREAMIFY</Text>
        <Text style={styles.subtitle}>Create an account to start listening.</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor={KineticTheme.colors.onSurfaceVariant}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={KineticTheme.colors.onSurfaceVariant}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={KineticTheme.colors.onSurfaceVariant}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity style={styles.loginBtn} onPress={handleSignup} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={KineticTheme.colors.surface} />
            ) : (
              <Text style={styles.loginText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login' as any)}>
              <Text style={styles.footerLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: KineticTheme.colors.surface },
  gradient: { position: 'absolute', inset: 0, zIndex: 0 },
  content: { flex: 1, paddingHorizontal: 32, justifyContent: 'center', zIndex: 10 },
  title: { fontFamily: KineticTheme.typography.headlineItalic, fontSize: 42, color: KineticTheme.colors.primary, textAlign: 'center', letterSpacing: -1, marginBottom: 8 },
  subtitle: { fontFamily: KineticTheme.typography.bodyMedium, fontSize: 16, color: KineticTheme.colors.onSurfaceVariant, textAlign: 'center', marginBottom: 40 },
  form: { gap: 16 },
  input: { height: 56, backgroundColor: KineticTheme.colors.surfaceHighest, borderRadius: 16, paddingHorizontal: 20, fontFamily: KineticTheme.typography.bodyMedium, fontSize: 16, color: KineticTheme.colors.onSurface, borderWidth: 1, borderColor: KineticTheme.colors.glassBorder },
  errorText: { fontFamily: KineticTheme.typography.body, color: '#FF6B6B', fontSize: 14, textAlign: 'center' },
  loginBtn: { height: 56, backgroundColor: KineticTheme.colors.secondary, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  loginText: { fontFamily: KineticTheme.typography.headline, fontSize: 16, color: KineticTheme.colors.surface, letterSpacing: 1 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { fontFamily: KineticTheme.typography.body, color: KineticTheme.colors.onSurfaceVariant },
  footerLink: { fontFamily: KineticTheme.typography.bodyBold, color: KineticTheme.colors.secondary },
});
