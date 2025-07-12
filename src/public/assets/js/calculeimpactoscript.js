
const fatores = {
    papel:   { arvores: 0.25, agua: 540 },   // por kg
    plastico:{ arvores: 0,    agua: 50  },
    vidro:   { arvores: 0,    agua: 10  },
    metal:   { arvores: 0,    agua: 30  }
  };
  
  document.getElementById('calcular').addEventListener('click', function() {
    const material = document.getElementById('material').value;
    const quantidade = parseFloat(document.getElementById('quantidade').value);
  
    let arvores = 0;
    let agua = 0;
  
    if (!isNaN(quantidade) && quantidade > 0) {
      arvores = Math.round(fatores[material].arvores * quantidade);
      agua = Math.round(fatores[material].agua * quantidade);
    }
  
    document.getElementById('arvores').textContent = arvores;
    document.getElementById('agua').textContent = agua + 'L';
  });