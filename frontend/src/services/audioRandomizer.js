const audioModules = import.meta.glob('../audios/**/*.mp3', { eager: true });

export function playRandomAudio(folderName) {
  const folderNameLower = folderName.toLowerCase();

  const audioFilesInFolder = Object.keys(audioModules).filter(
    key => key.includes(`../audios/${folderNameLower}/`)
  );

  console.log(`🎵 Procurando áudios em: ${folderNameLower}`);
  console.log(`📁 Áudios encontrados:`, audioFilesInFolder);

  if (audioFilesInFolder.length === 0) {
    console.error(`❌ Nenhum áudio encontrado na pasta: ${folderNameLower}`);
    console.error(`Pastas disponíveis:`, Object.keys(audioModules).map(k => k.split('/')[2]).filter(Boolean));
    return null;
  }

  const randomIndex = Math.floor(Math.random() * audioFilesInFolder.length);
  const selectedAudioKey = audioFilesInFolder[randomIndex];
  const audioFileName = selectedAudioKey.split('/').pop();

  const audioModule = audioModules[selectedAudioKey];
  const audioUrl = audioModule.default;

  console.log(`✓ Áudio selecionado: ${audioFileName}`);
  console.log(`▶ URL: ${audioUrl}`);

  const audio = new Audio(audioUrl);
  audio.volume = 1;

  audio.addEventListener('play', () => {
    console.log(`▶ TOCANDO: ${audioFileName}`);
  });

  audio.addEventListener('error', (e) => {
    console.error(`❌ Erro ao tocar áudio:`, e);
  });

  audio.addEventListener('ended', () => {
    console.log(`✓ Áudio finalizado`);
  });

  audio.play().catch(error => {
    console.error(`❌ Erro ao reproduzir:`, error);
  });

  return audio;
}
