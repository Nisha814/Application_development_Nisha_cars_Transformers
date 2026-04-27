// Auto-dismiss toast
const toast = document.getElementById('toast');
if (toast) {
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity .5s'; }, 3500);
    setTimeout(() => toast.remove(), 4000);
}

// Vehicle modal
function openModal() {
    document.getElementById('vehicle-modal').classList.add('open');
    document.body.style.overflow = 'hidden';
}
function closeModal() {
    document.getElementById('vehicle-modal')?.classList.remove('open');
    document.body.style.overflow = '';
}
function closeModalOnOverlay(e) {
    if (e.target === document.getElementById('vehicle-modal')) closeModal();
}

// ESC to close modal
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
});

// Auto-submit search on vehicle/history pages on Enter
document.querySelectorAll('.search-input').forEach(input => {
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.target.closest('form')?.submit();
        }
    });
});

// Mobile nav toggle
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
        const open = navLinks.style.display === 'flex';
        navLinks.style.display = open ? '' : 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '64px';
        navLinks.style.left = '0';
        navLinks.style.right = '0';
        navLinks.style.background = '#fff';
        navLinks.style.padding = '1rem';
        navLinks.style.boxShadow = '0 4px 6px rgba(0,0,0,.07)';
        navLinks.style.zIndex = '99';
    });
}
