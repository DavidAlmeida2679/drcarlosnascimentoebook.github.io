// Modal functionality
const modal = document.getElementById('ebookModal');
const modalTitle = document.getElementById('modalTitle');
const ebookTypeInput = document.getElementById('ebookType');
const ebookForm = document.getElementById('ebookForm');
const successMessage = document.getElementById('successMessage');
const closeModal = document.querySelector('.close-modal');
const ebookBtns = document.querySelectorAll('.ebook-btn');

// Google Sheets ID and sheet names
const scriptURL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
const sheetNames = {
    'odontofobia': 'Odontofobia',
    'pais-pcd': 'Pais PcD'
};

// Ebook information
const ebooks = {
    'odontofobia': {
        title: 'Pare de Ter Medo do Dentista',
        fileUrl: 'URL_DO_SEU_EBOOK_ODONTOFOBIA.pdf',
        emailSubject: 'Seu ebook "Pare de Ter Medo do Dentista" chegou!',
        emailBody: `Olá {nome},\n\nObrigado por baixar nosso ebook "Pare de Ter Medo do Dentista". Esperamos que ele ajude você a superar seus medos e ter uma experiência odontológica mais tranquila.\n\nBaixe seu ebook aqui: {link}\n\nAtenciosamente,\nEquipe Odontologia Sem Trauma`
    },
    'pais-pcd': {
        title: 'Guia Prático para Pais: Odontopediatria Inclusiva',
        fileUrl: 'URL_DO_SEU_EBOOK_PAIS_PCD.pdf',
        emailSubject: 'Seu ebook "Odontopediatria Inclusiva" está pronto!',
        emailBody: `Olá {nome},\n\nAgradecemos por baixar nosso ebook "Guia Prático para Pais: Odontopediatria Inclusiva". Esperamos que estas informações ajudem você e seu filho a terem uma experiência odontológica mais positiva.\n\nBaixe seu ebook aqui: {link}\n\nAtenciosamente,\nEquipe Odontologia Sem Trauma`
    }
};

// Open modal with appropriate title
ebookBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const ebookType = btn.getAttribute('data-ebook');
        ebookTypeInput.value = ebookType;
        
        modalTitle.textContent = `Baixe o ebook "${ebooks[ebookType].title}"`;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });
});

// Close modal
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    resetForm();
});

// Close when clicking outside modal
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        resetForm();
    }
});

// Form validation and submission
ebookForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Reset errors
    document.querySelectorAll('.error').forEach(el => {
        el.style.display = 'none';
    });
    
    // Get values
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const ebookType = ebookTypeInput.value;
    
    // Validate
    let isValid = true;
    
    if (!name) {
        document.getElementById('nameError').style.display = 'block';
        isValid = false;
    }
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById('emailError').style.display = 'block';
        isValid = false;
    }
    
    if (!phone || !/^\([0-9]{2}\) [0-9]{5}-[0-9]{4}$/.test(phone)) {
        document.getElementById('phoneError').style.display = 'block';
        isValid = false;
    }
    
    if (isValid) {
        try {
            // Show loading state
            const submitBtn = ebookForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            
            // Prepare data for Google Sheets
            const formData = new FormData();
            formData.append('sheetName', sheetNames[ebookType]);
            formData.append('name', name);
            formData.append('email', email);
            formData.append('phone', phone);
            formData.append('date', new Date().toLocaleString());
            
            // Send data to Google Sheets
            const response = await fetch(scriptURL, {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                // Prepare email data
                const emailData = {
                    to: email,
                    subject: ebooks[ebookType].emailSubject,
                    body: ebooks[ebookType].emailBody
                        .replace('{nome}', name)
                        .replace('{link}', ebooks[ebookType].fileUrl)
                };
                
                // Send email (this would be handled by your Google Apps Script)
                // In a real implementation, you would add this to your formData
                // and handle it in your Google Apps Script
                
                // Show success message
                ebookForm.style.display = 'none';
                successMessage.style.display = 'block';
                
                // Reset form after delay
                setTimeout(() => {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                    resetForm();
                    
                    // Show confirmation to user
                    Swal.fire({
                        title: 'Ebook enviado!',
                        text: `O ebook "${ebooks[ebookType].title}" foi enviado para seu e-mail. Verifique sua caixa de entrada e spam.`,
                        icon: 'success',
                        confirmButtonColor: 'var(--dourado)'
                    });
                }, 3000);
            } else {
                throw new Error('Erro ao enviar dados');
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                title: 'Erro',
                text: 'Ocorreu um erro ao enviar seus dados. Por favor, tente novamente.',
                icon: 'error',
                confirmButtonColor: 'var(--dourado)'
            });
            resetForm();
        }
    }
});

// Reset form function
function resetForm() {
    ebookForm.reset();
    ebookForm.style.display = 'block';
    successMessage.style.display = 'none';
    const submitBtn = ebookForm.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Enviar';
}

// Phone mask
document.getElementById('phone').addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 0) {
        value = '(' + value;
    }
    if (value.length > 3) {
        value = value.substring(0, 3) + ') ' + value.substring(3);
    }
    if (value.length > 10) {
        value = value.substring(0, 10) + '-' + value.substring(10, 14);
    }
    
    e.target.value = value;
});

// Video play functionality
document.querySelector('.video-container').addEventListener('click', () => {
    // Replace with your actual video embed code
    const videoEmbed = `
        <iframe width="800" height="450" src="https://www.youtube.com/embed/SEU_VIDEO_ID" 
        frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen></iframe>
    `;
    
    Swal.fire({
        html: videoEmbed,
        width: 850,
        padding: '0',
        background: 'transparent',
        showConfirmButton: false,
        backdrop: 'rgba(0,0,0,0.8)'
    });
});
// PRÉ-CARREGAMENTO DAS FOTOS (OPCIONAL PARA MELHOR PERFORMANCE)
document.addEventListener('DOMContentLoaded', function() {
    const fotos = [
        'fotos-depoentes/alexandra.jpg',
        'fotos-depoentes/jaldenira.jpg',
        'fotos-depoentes/jessica.jpg'
    ];
    
    fotos.forEach(foto => {
        new Image().src = foto; // Pré-carrega as imagens
    });
});