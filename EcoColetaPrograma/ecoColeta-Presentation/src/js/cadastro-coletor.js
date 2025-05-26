class EcoColetaForm {
  constructor() {
    this.form = document.getElementById("collector-form")
    this.submitBtn = document.getElementById("submit-btn")
    this.btnText = document.getElementById("btn-text")
    this.btnLoading = document.getElementById("btn-loading")
    this.mainForm = document.getElementById("main-form")
    this.successPage = document.getElementById("success-page")

    this.init()
  }

  init() {
    // Initialize Lucide icons
    lucide.createIcons()

    // Add event listeners
    this.addEventListeners()

    // Check terms checkbox to enable submit button
    this.checkFormValidity()
  }

  addEventListeners() {
    // Form submission
    this.form.addEventListener("submit", (e) => this.handleSubmit(e))

    // Input formatting
    document.getElementById("cpf").addEventListener("input", (e) => this.formatCPF(e))
    document.getElementById("telefone").addEventListener("input", (e) => this.formatPhone(e))
    document.getElementById("cep").addEventListener("input", (e) => this.formatCEP(e))

    // Vehicle type visibility
    document.getElementById("possuiVeiculo").addEventListener("change", (e) => this.toggleVehicleType(e))

    // Terms checkbox
    document.getElementById("aceitaTermos").addEventListener("change", () => this.checkFormValidity())

    // New registration button
    document.getElementById("new-registration").addEventListener("click", () => this.resetForm())

    // CEP lookup
    document.getElementById("cep").addEventListener("blur", (e) => this.lookupCEP(e))
  }

  formatCPF(e) {
    let value = e.target.value.replace(/\D/g, "")
    value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    e.target.value = value
  }

  formatPhone(e) {
    let value = e.target.value.replace(/\D/g, "")
    value = value.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
    e.target.value = value
  }

  formatCEP(e) {
    let value = e.target.value.replace(/\D/g, "")
    value = value.replace(/(\d{5})(\d{3})/, "$1-$2")
    e.target.value = value
  }

  toggleVehicleType(e) {
    const tipoVeiculoGroup = document.getElementById("tipoVeiculoGroup")
    if (e.target.value === "sim") {
      tipoVeiculoGroup.style.display = "block"
    } else {
      tipoVeiculoGroup.style.display = "none"
      document.getElementById("tipoVeiculo").value = ""
    }
  }

  checkFormValidity() {
    const termsAccepted = document.getElementById("aceitaTermos").checked
    this.submitBtn.disabled = !termsAccepted
  }

  async lookupCEP(e) {
    const cep = e.target.value.replace(/\D/g, "")
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
        const data = await response.json()

        if (!data.erro) {
          document.getElementById("endereco").value = data.logradouro || ""
          document.getElementById("bairro").value = data.bairro || ""
          document.getElementById("cidade").value = data.localidade || ""
          document.getElementById("estado").value = data.uf || ""
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error)
      }
    }
  }

  async handleSubmit(e) {
    e.preventDefault()

    // Show loading state
    this.setLoadingState(true)

    // Get form data
    const formData = this.getFormData()

    try {
      // Send to server
      const response = await fetch("http://localhost:3001/coletores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        // Show success page
        this.showSuccessPage()
      } else {
        throw new Error("Erro ao enviar cadastro")
      }
    } catch (error) {
      console.error("Erro:", error)
      alert("Erro ao enviar cadastro. Tente novamente.")
    } finally {
      this.setLoadingState(false)
    }
  }

  getFormData() {
    const formData = new FormData(this.form)
    const data = {}

    // Get regular form fields\
    for (let [key, value] = formData.entries()) {
            if (key !== 'materiaisInteresse') {
                data[key] = value;
            }
        }

    // Get materials (checkboxes)
    const materials = []
    const materialCheckboxes = document.querySelectorAll('input[name="materiaisInteresse"]:checked')
    materialCheckboxes.forEach((checkbox) => {
      materials.push(checkbox.value)
    })
    data.materiaisInteresse = materials

    // Add timestamp
    data.dataCadastro = new Date().toISOString()
    data.id = Date.now().toString()

    return data
  }

  setLoadingState(loading) {
    if (loading) {
      this.btnText.classList.add("hidden")
      this.btnLoading.classList.remove("hidden")
      this.submitBtn.disabled = true
    } else {
      this.btnText.classList.remove("hidden")
      this.btnLoading.classList.add("hidden")
      this.submitBtn.disabled = !document.getElementById("aceitaTermos").checked
    }
  }

  showSuccessPage() {
    this.mainForm.classList.add("hidden")
    this.successPage.classList.remove("hidden")
    window.scrollTo(0, 0)
  }

  resetForm() {
    this.form.reset()
    this.successPage.classList.add("hidden")
    this.mainForm.classList.remove("hidden")
    document.getElementById("tipoVeiculoGroup").style.display = "none"
    this.checkFormValidity()
    window.scrollTo(0, 0)
  }
}

// Initialize the form when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new EcoColetaForm()
})
