import { useEffect, useState } from 'react';
import { Accelerometer } from 'expo-sensors';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function App() {
  // 1 o estado gaurda a ultima assinatura enviada pelo sensor.
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');

  // 2 ao abrir a tela, começamos a ouvir o acelerômetro.
  useEffect(() => {
    let assinatura;
    let ativo = true;

    async function iniciarSensor() {
      try{
        const disponivel = await Accelerometer.isAvailableAsync();
        if (!ativo) return;
        if (!disponivel) {
          setErro('Sensor indisponivel. Abra em um celular fisico.');
          return;
        }

        Accelerometer.setUpdateInterval(100); // uma leitura a cada 100ms.
        assinatura = Accelerometer.addListener((Leitura) => {
          if (ativo) setDados(Leitura);
        });
      } catch {
        if (ativo) setErro('Não foi possivel acessar o sensor. Reabra o app.');
      }
    }

    iniciarSensor();

    // ao sair da tela, paramos de ouvir o sensor.
    return () => {
      ativo = false;
      assinatura?.remove();
    };
  }, []);

  // 3, x e y controlam o movimento. são valores em g, não em graus.
  const x = dados?.x ?? 0;
  const y = dados?.y ?? 0;
  const nivelado = dados !== null && Math.abs(x) < 0.04 && Math.abs(y) < 0.04;
  const cor = nivelado ? '#22c55e' : '#facc15';

  // multiplicar amplia o movimento, o limite mantem a bolha no circulo.
  const deslocamentoX = x * 100;
  const deslocamentoY = y * 100;
  const distancia = Math.hypot(deslocamentoX, deslocamentoY);
  const limite = Math.max(1, distancia / 90);

  // 4 a tela se atualiza automaticamente quando o estado muda.
  return (
    <ScrollView contentContainerStyle={styles.tela}>
      <StatusBar style="light" />
      <text style={styles.titulo}>Nivel de bolha</text>
      <text style={styles.instrucao}>Apoie o celular com a tela para cima.{ '\n' }Incline devagar e observe a bolha.</text>

      <View style={styles.nivel}>
        <view style={styles.linhaHorizontal} />
        <view style={styles.linhaVertical} />
        <view style={styles.alvo} />
        {dados && !erro && (
          <View style={[styles.bolha, {
            backgroundColor: cor,
                transform: [
                  { translateX: deslocamentoX / limite },
                  { translateY: deslocamentoY / limite },
                ],
              }]} />
        )}
      </View>

      <Text style={[styles.status, { color: erro ? '#fca5a5' : cor }]}>
        {erro || (!dados ? 'Aguardando sensor...' : nivelado ? 'Nivelado' : 'Inclinado')}
      </Text>
      <Text style={styles.leitura}>
        x: {dados?.x.toFixed(2) : '--'} g  |  y: {dados?.y.toFixed(2) : '--'} g
      </Text>
      <Text style={styles.rodape}>Bolha verde no centro = celular nivelado</Text>
    </ScrollView>
  );
}

// 5 style fica aqui. A bolha é uma View, sem imagem externa.
const styles = StyleSheet.create({
  tela: {
    flexGrow: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 64
  },
  titulo: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    },
    instrucao: {
      color: '#cbd5e1',
      fontSize: 16,
      textAlign: 'center',
      lineHeight: 25,
      marginTop: 16,
      marginBottom: 32,
    },
  nivel: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linhaHorizontal: {
    position: 'absolute',
    width: 216,
    height: 1,
    backgroundColor: '#475569',
  },
  linhaVertical: {
    position: 'absolute',
    width: 1,
    height: 216,
    backgroundColor: '#475569',
  },
  alvo: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#94a3b8',
  },
  bolha: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  status: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 28,
    textAlign: 'center',
  },
  leitura: {
    color: '#ffffff',
    fontSize: 17,
    marginTop: 16,
    fontVariant: {'tabular-nums'}
  },
  rodape: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 28,
    textAlign: 'center',
  },
});