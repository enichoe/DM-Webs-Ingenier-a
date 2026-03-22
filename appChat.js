// ========================================
    // CHATBOT VENDEDOR - SISTEMA INTELIGENTE
    // ========================================

    (function() {
      'use strict';

      // ===== CONFIGURACIÓN =====
      const CONFIG = {
        developerName: 'Ernesto',
        whatsappNumber: '972498691', // Cambiar por número real
        autoOpenDelay: 6000, // 6 segundos
        inactivityTimeout: 45000, // 45 segundos
        typingDelay: { min: 800, max: 2000 },
        messageDelay: { min: 500, max: 1500 }
      };

      // ===== ESTADO DEL CHATBOT =====
      const state = {
        isOpen: false,
        hasOpened: false,
        conversationStage: 0,
        leadScore: 0,
        projectType: null,
        businessType: null,
        hasProblem: false,
        needsConsultation: false,
        isTyping: false,
        inactivityTimer: null,
        reEngagementCount: 0
      };

      // ===== ELEMENTOS DEL DOM =====
      let toggleBtn = null;
      let chatWindow = null;
      let messagesContainer = null;
      let inputField = null;
      let sendBtn = null;
      let closeBtn = null;


      // ========================================
      // 🧠 CEREBRO VENDEDOR - DM WEBS CLOSER
      // ========================================
      const RESPONSES = {
        greeting: {
          message: `Hola. Soy el consultor estratégico de **DM Webs**.\n\nNo estoy aquí para venderte un diseño, estoy aquí para resolver un problema de negocio. Para saber si podemos ayudarte, necesito ser directo:\n\n**¿Tu presencia digital actual te está generando dinero o solo te está costando tiempo?**`,
          quickReplies: [
            'Tengo web, pero no vende',
            'No tengo presencia digital',
            'Quiero automatizar ventas',
            'Solo estoy investigando'
          ]
        },

        projectTypes: {
          'Tengo web, pero no vende': {
            message: 'Diagnóstico rápido: Tienes un pasivo, no un activo. Una web que no convierte es un vendedor que espanta clientes.\n\n**¿Cuál es el principal motivo por el que crees que tus visitas no se transforman en ventas?**',
            quickReplies: ['Diseño obsoleto', 'No genera confianza', 'Es muy lenta', 'No tengo idea'],
            score: 20,
            type: 'audit'
          },
          'No tengo presencia digital': {
            message: 'Eso significa que tu negocio es invisible para el 90% de tu mercado. Estás dejando dinero sobre la mesa cada día que pasa.\n\n**¿Qué comercializas y cuál es tu urgencia real de empezar a facturar en digital?**',
            quickReplies: ['Servicios profesionales', 'Tienda/E-commerce', 'Consultoría/Marca Personal'],
            score: 25,
            type: 'new'
          },
          'Quiero automatizar ventas': {
            message: 'Esa es la mentalidad correcta. Si dependes de responder manualmente cada mensaje, tienes un trabajo, no un negocio escalable.\n\n**¿Cuántos leads potenciales pierdes al día por no responder a tiempo?**',
            quickReplies: ['Menos de 10', 'Más de 30', 'Demasiados para contarlos'],
            score: 30,
            type: 'automation'
          },
          'Solo estoy investigando': {
            message: 'Investigar está bien, pero la ejecución es lo que paga las facturas. Mientras investigas, tu competencia ya está cerrando ventas.\n\n**¿Te gustaría ver cómo transformamos visitantes en clientes reales?**',
            quickReplies: ['Sí, muéstrame casos', 'Todavía no es el momento'],
            score: 5,
            type: 'cold'
          }
        },

        businessStage: {
          'Diseño obsoleto': {
            message: 'Un diseño anticuado grita "falta de profesionalismo". Eso mata la confianza antes de que leas tu oferta.\n\nEn **DM Webs** no diseñamos por diseñar. Creamos arquitecturas de persuasión.\n\n**¿Quieres que analicemos tu caso y te digamos exactamente dónde estás perdiendo dinero?**',
            quickReplies: ['Sí, revisen mi caso', 'Hablemos por WhatsApp'],
            score: 15
          },
          'No genera confianza': {
            message: 'En internet, la confianza es la moneda. Sin ella, el precio no importa: no compran.\n\nNosotros implementamos psicología de ventas y pruebas sociales estratégicas para que el cliente sienta que eres la única opción lógica.',
            quickReplies: ['Agendar diagnóstico', 'Hablar con un asesor'],
            score: 15
          },
          'Servicios profesionales': {
            message: 'En servicios, tu reputación lo es todo. Tu web debe ser tu mejor vendedor, trabajando 24/7 sin excusas.\n\nSi no está optimizada para captar leads calificados, estás trabajando el doble por la mitad de resultados.\n\n**¿Te interesa un sistema de alta conversión listo en días?**',
            quickReplies: ['Sí, quiero resultados', 'Ver inversión requerida'],
            score: 15
          }
        },

        problems: {
          'Es muy lenta': {
            message: 'Si tu web tarda más de 3 segundos en cargar, estás quemando dinero. El usuario se va y se lo lleva tu competencia.\n\nEsto es técnicamente solucionable y el impacto en ventas es inmediato.',
            score: 15
          },
          'Demasiados para contarlos': {
            message: 'Estás sentado sobre una mina de oro sin excavar. Cada lead perdido es dinero que se va.\n\nNuestra automatización recupera esas ventas automáticamente.',
            score: 20
          },
          'Sí, quiero resultados': {
            message: 'Decisión correcta. Solo aceptamos proyectos donde sabemos que podemos generar un ROI claro. Esta semana nos quedan **2 cupos** para nuevos desarrollos.',
            score: 25
          }
        },

        interestIndicators: [
          'cuanto cuesta', 'precio', 'presupuesto', 'tiempo', 'urgente', 'ahora', 'interesa', 'contacto', 'llamada', 'whatsapp', 'numero', 'inversion', 'cotizacion'
        ],

        closing: {
          threshold: 30,
          messages: [
            'Mira, el tiempo es el recurso más valioso. Si tu objetivo es escalar ingresos, necesitas tomar acción.\n\n**Hablemos 5 minutos por WhatsApp y definamos si podemos trabajar juntos.**',
            'He revisado tu perfil. Tenemos la capacidad de ejecutar esto, pero nuestra disponibilidad es limitada por la calidad que entregamos.\n\n**¿Aseguramos tu cupo ahora?**',
            'El mercado no espera a que te decidas. Cada día que pasa sin una estrategia digital funcional es dinero perdido.\n\n**¿Avanzamos con una propuesta concreta hoy mismo?**'
          ]
        },

        reEngagement: [
          '¿Sigues ahí? Recuerda que los resultados llegan para los que toman acción, no para los que esperan.',
          'Otro cliente acaba de reservar su consultoría. ¿Quieres asegurar la tuya antes de que se agote el mes?',
          'Tu negocio tiene potencial, pero el potencial sin ejecución no sirve. ¿Hablamos por WhatsApp y cerramos el plan?'
        ]
      };


      // ===== FUNCIONES UTILITARIAS =====
      function randomDelay(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        // Simple Markdown Parser for Bold
        let html = div.innerHTML;
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return html.replace(/\n/g, '<br>');
      }

      function getCurrentTime() {
        return new Date().toLocaleTimeString('es-MX', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      }

      function containsKeywords(text, keywords) {
        const lowerText = text.toLowerCase();
        return keywords.some(keyword => lowerText.includes(keyword));
      }

      // ===== GESTIÓN DE MENSAJES =====
      function addMessage(text, isBot = true, withReplies = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isBot ? 'bot' : 'user'}`;
        
        const avatarSvg = isBot 
          ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';

        const formattedText = text.replace(/\${CONFIG\.developerName}/g, CONFIG.developerName);

        messageDiv.innerHTML = `
          <div class="message-avatar">${avatarSvg}</div>
          <div class="message-content">
            <div class="message-bubble">${escapeHtml(formattedText)}</div>
            <div class="message-time">${getCurrentTime()}</div>
          </div>
        `;

        messagesContainer.appendChild(messageDiv);
        
        if (withReplies && withReplies.length > 0) {
          const repliesDiv = document.createElement('div');
          repliesDiv.className = 'quick-replies';
          
          withReplies.forEach(reply => {
            const btn = document.createElement('button');
            btn.className = 'quick-reply-btn';
            btn.textContent = reply;
            btn.addEventListener('click', () => handleQuickReply(reply));
            repliesDiv.appendChild(btn);
          });
          
          messagesContainer.appendChild(repliesDiv);
        }

        scrollToBottom();
      }

      function addTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
          <div class="message-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 8V4H8"></path>
              <rect width="16" height="12" x="4" y="8" rx="2"></rect>
              <path d="M2 14h2"></path>
              <path d="M20 14h2"></path>
              <path d="M15 13v2"></path>
              <path d="M9 13v2"></path>
            </svg>
          </div>
          <div class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        `;
        messagesContainer.appendChild(typingDiv);
        scrollToBottom();
      }

      function removeTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) indicator.remove();
      }

      function addCTAButton() {
        const ctaDiv = document.createElement('div');
        ctaDiv.className = 'message bot';
        ctaDiv.innerHTML = `
          <div class="message-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 8V4H8"></path>
              <rect width="16" height="12" x="4" y="8" rx="2"></rect>
              <path d="M2 14h2"></path>
              <path d="M20 14h2"></path>
              <path d="M15 13v2"></path>
              <path d="M9 13v2"></path>
            </svg>
          </div>
          <div class="message-content">
  <a href="https://wa.me/${CONFIG.whatsappNumber}?text=🚀%20Hola%20${CONFIG.developerName}!%0A%0A👋%20Estoy%20interesado%20en%20desarrollar%20un%20*proyecto%20web*.%0A%0A💡%20Me%20gustaria%20saber:%0A•%20Como%20podemos%20empezar%0A•%20Tiempo%20de%20desarrollo%0A•%20Costo%20aproximado%0A%0A📲%20Quedo%20atento%20a%20tu%20respuesta.%20Gracias!" 
     target="_blank" rel="noopener"
     class="cta-button">
     
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>Agendar Estrategia
  </a>
</div>
        `;
        messagesContainer.appendChild(ctaDiv);
        scrollToBottom();
      }

      function scrollToBottom() {
        requestAnimationFrame(() => {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        });
      }

      // ===== LÓGICA DE CONVERSACIÓN =====
      function processUserMessage(text) {
        // Reset inactivity timer
        resetInactivityTimer();
        
        // Add user message
        addMessage(text, false);
        
        // Show typing indicator
        state.isTyping = true;
        addTypingIndicator();
        
        // Process after delay
        const delay = randomDelay(CONFIG.typingDelay.min, CONFIG.typingDelay.max);
        
        setTimeout(() => {
          removeTypingIndicator();
          state.isTyping = false;
          generateResponse(text);
        }, delay);
      }

      function generateResponse(text) {
        const lowerText = text.toLowerCase();
        
        // Check for interest indicators
        if (containsKeywords(text, RESPONSES.interestIndicators)) {
          state.leadScore += 15;
          state.hasProblem = true;
        }

        // Stage-based responses
        switch (state.conversationStage) {
          case 0:
            handleInitialResponse(text);
            break;
          case 1:
            handleProjectResponse(text);
            break;
          case 2:
            handleBusinessResponse(text);
            break;
          case 3:
            handleProblemResponse(text);
            break;
          default:
            handleGeneralResponse(text);
        }

        // Check if ready to close
        if (state.leadScore >= RESPONSES.closing.threshold && state.conversationStage >= 2) {
          setTimeout(() => {
            showClosingMessage();
          }, randomDelay(CONFIG.messageDelay.min, CONFIG.messageDelay.max));
        }
      }

      function handleInitialResponse(text) {
        // Find matching project type
        let matched = false;
        
        for (const [key, value] of Object.entries(RESPONSES.projectTypes)) {
          if (text.toLowerCase().includes(key.toLowerCase().substring(0, 10))) {
            state.projectType = value.type;
            state.leadScore += value.score;
            state.conversationStage = 1;
            addMessage(value.message, true, value.quickReplies);
            matched = true;
            break;
          }
        }

        if (!matched) {
          // Treat as custom response
          state.leadScore += 5;
          state.conversationStage = 1;
          addMessage('Entiendo. Para ayudarte correctamente necesito entender tu situación. ¿Tienes actualmente un negocio activo o estás empezando desde cero?', true);
        }
      }

      function handleProjectResponse(text) {
        let matched = false;
        
        for (const [key, value] of Object.entries(RESPONSES.businessStage)) {
          if (text.toLowerCase().includes(key.toLowerCase().substring(0, 8))) {
            state.businessType = key;
            state.leadScore += value.score;
            state.conversationStage = 2;
            addMessage(value.message, true, value.quickReplies);
            matched = true;
            break;
          }
        }

        if (!matched) {
          state.conversationStage = 2;
          addMessage('De acuerdo. Para darte una solución real, dime: ¿Cuál es el obstáculo principal que te impide facturar más hoy?', true);
        }
      }

      function handleBusinessResponse(text) {
        let matched = false;
        
        for (const [key, value] of Object.entries(RESPONSES.problems)) {
          if (text.toLowerCase().includes(key.toLowerCase().substring(0, 6))) {
            state.leadScore += value.score;
            state.hasProblem = true;
            state.conversationStage = 3;
            addMessage(value.message, true);
            matched = true;
            break;
          }
        }

        if (!matched) {
          state.leadScore += 8;
          state.conversationStage = 3;
          addMessage('Entendido. ${CONFIG.developerName} ha resuelto problemas similares antes. La clave está en tener un sistema, no solo una web.\n\n**¿Te gustaría conocer nuestro proceso de trabajo?**', true, ['Sí, explícame el proceso', 'Ir directo al grano']);
        }
      }

      function handleProblemResponse(text) {
        if (text.toLowerCase().includes('si') || text.toLowerCase().includes('claro') || text.toLowerCase().includes('proceso')) {
          addMessage('Nuestro proceso es directo:\n\n1. **Diagnóstico**: Identificamos fugas de ventas.\n2. **Propuesta**: Diseño estratégico con precio y tiempo.\n3. **Ejecución**: Desarrollo y lanzamiento.\n4. **Resultados**: Medimos el impacto en tu facturación.\n\nSin relleno. Solo enfoque en ROI.', true);
        } else {
          handleGeneralResponse(text);
        }
      }

      function handleGeneralResponse(text) {
        state.leadScore += 5;
        
        if (state.leadScore < RESPONSES.closing.threshold) {
          addMessage('Comprendido. ¿Hay algo específico que te detiene para dar el salto a ventas digitales?', true);
        }
      }

      function showClosingMessage() {
        const messageIndex = Math.min(state.reEngagementCount, RESPONSES.closing.messages.length - 1);
        const closingMessage = RESPONSES.closing.messages[messageIndex];
        
        addMessage(closingMessage, true);
        setTimeout(() => {
          addCTAButton();
        }, 500);
      }

      function handleQuickReply(text) {
        // Remove existing quick replies
        const existingReplies = document.querySelector('.quick-replies');
        if (existingReplies) existingReplies.remove();
        
        // Process the reply
        processUserMessage(text);
      }

      // ===== GESTIÓN DE UI =====
      function openChat() {
        state.isOpen = true;
        state.hasOpened = true;
        toggleBtn.classList.add('active');
        chatWindow.classList.add('open');
        
        // Remove notification dot
        const dot = toggleBtn.querySelector('.notification-dot');
        if (dot) dot.style.display = 'none';
        
        // Start conversation if first time
        if (messagesContainer.children.length === 0) {
          setTimeout(() => {
            addMessage(RESPONSES.greeting.message, true, RESPONSES.greeting.quickReplies);
          }, 500);
        }
        
        resetInactivityTimer();
        inputField.focus();
      }

      function closeChat() {
        state.isOpen = false;
        toggleBtn.classList.remove('active');
        chatWindow.classList.remove('open');
        clearInactivityTimer();
      }

      function toggleChat() {
        if (state.isOpen) {
          closeChat();
        } else {
          openChat();
        }
      }

      // ===== AUTOMATIZACIÓN =====
      function resetInactivityTimer() {
        clearInactivityTimer();
        
        state.inactivityTimer = setTimeout(() => {
          if (state.isOpen && !state.isTyping && state.reEngagementCount < 2) {
            showReEngagement();
          }
        }, CONFIG.inactivityTimeout);
      }

      function clearInactivityTimer() {
        if (state.inactivityTimer) {
          clearTimeout(state.inactivityTimer);
          state.inactivityTimer = null;
        }
      }

      function showReEngagement() {
        state.reEngagementCount++;
        const message = RESPONSES.reEngagement[Math.min(state.reEngagementCount - 1, RESPONSES.reEngagement.length - 1)];
        addMessage(message, true);
      }

      function autoOpen() {
        if (!state.hasOpened) {
          // Show notification animation
          toggleBtn.style.animation = 'none';
          toggleBtn.offsetHeight; // Trigger reflow
          toggleBtn.style.animation = 'floatIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
          
          setTimeout(() => {
            openChat();
          }, 500);
        }
      }

      // ===== EVENT HANDLERS =====
      function handleInputKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      }

      function sendMessage() {
        const text = inputField.value.trim();
        if (text) {
          inputField.value = '';
          inputField.style.height = 'auto';
          processUserMessage(text);
        }
      }

      function autoResizeInput() {
        inputField.style.height = 'auto';
        inputField.style.height = Math.min(inputField.scrollHeight, 120) + 'px';
      }

      // ===== INICIALIZACIÓN =====
      function init() {
        // Get DOM elements
        toggleBtn = document.getElementById('chatbotToggle');
        chatWindow = document.getElementById('chatbotWindow');
        messagesContainer = document.getElementById('chatbotMessages');
        inputField = document.getElementById('chatbotInput');
        sendBtn = document.getElementById('chatbotSend');
        closeBtn = document.getElementById('chatbotClose');

        // Bind events
        toggleBtn.addEventListener('click', toggleChat);
        closeBtn.addEventListener('click', closeChat);
        sendBtn.addEventListener('click', sendMessage);
        inputField.addEventListener('keydown', handleInputKeydown);
        inputField.addEventListener('input', autoResizeInput);

        // Auto-open after delay
        setTimeout(autoOpen, CONFIG.autoOpenDelay);

        // Detect page visibility
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) {
            clearInactivityTimer();
          } else if (state.isOpen) {
            resetInactivityTimer();
          }
        });
      }

      // Start when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
      } else {
        init();
      }
    })();
  