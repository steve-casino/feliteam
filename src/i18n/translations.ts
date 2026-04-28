export const translations = {
  en: {
    // Navigation
    nav: {
      dashboard: 'Dashboard',
      cases: 'Cases',
      team: 'Team',
      settings: 'Settings',
      notifications: 'Notifications',
      leaderboard: 'Leaderboard'
    },

    // Common
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      export: 'Export',
      import: 'Import'
    },

    // User & Auth
    auth: {
      login: 'Log In',
      logout: 'Log Out',
      email: 'Email',
      password: 'Password',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot password?',
      signUp: 'Sign Up'
    },

    // Case Management
    cases: {
      title: 'Cases',
      newCase: 'New Case',
      caseNumber: 'Case Number',
      clientName: 'Client Name',
      clientPhone: 'Client Phone',
      clientDob: 'Date of Birth',
      dateOfAccident: 'Date of Accident',
      state: 'State',
      zipCode: 'Zip Code',
      accidentDescription: 'Accident Description',
      opposingParty: 'Opposing Party',
      policeReportNumber: 'Police Report Number',
      stage: 'Stage',
      assignedTo: 'Assigned To',
      notes: 'Notes',
      isUrgent: 'Is Urgent',
      isMinor: 'Is Minor',
      insurance: 'Insurance Information',
      biPolicy: 'BI Policy Limit',
      pdPolicy: 'PD Policy Limit',
      umPolicy: 'UM/PIP Policy',
      treatmentStatus: 'Treatment Status',
      notStarted: 'Not Started',
      inProgress: 'In Progress',
      completed: 'Completed',
      gap: 'Treatment Gap',
      clinicInfo: 'Clinic Information',
      vehicleImpound: 'Vehicle Impound Date',
      addNote: 'Add Note',
      callLog: 'Call Log',
      treatmentLog: 'Treatment Log',
      stageChange: 'Stage Change',
      closeCase: 'Close Case',
      reopenCase: 'Reopen Case'
    },

    // Case Stages
    stages: {
      new_case: 'New Case',
      trt: 'Treatment',
      liability: 'Liability',
      property_damage: 'Property Damage',
      dem: 'Demand',
      srl: 'Settlement/Litigation'
    },

    // Letters of Representation
    lor: {
      biLor: 'BI LOR',
      umPipLor: 'UM/PIP LOR',
      status: 'LOR Status',
      pending: 'Pending',
      sent: 'Sent',
      received: 'Received',
      send: 'Send LOR',
      follow_up: 'Follow Up'
    },

    // Police Report
    policeReport: {
      status: 'Police Report Status',
      obtain: 'Obtain Report',
      pending: 'Pending',
      obtained: 'Obtained',
      notNeeded: 'Not Needed',
      daysPending: 'Days Pending'
    },

    // Checklist
    checklist: {
      title: 'Checklist',
      intake: 'Intake',
      treatment: 'Treatment',
      documentation: 'Documentation',
      liability: 'Liability',
      settlement: 'Settlement',
      addItem: 'Add Item',
      completeItem: 'Complete Item',
      incompleteRate: 'Incomplete Rate',
      completionRate: 'Completion Rate'
    },

    // Team
    team: {
      title: 'Team',
      members: 'Team Members',
      announcements: 'Announcements',
      celebrations: 'Celebrations',
      shoutouts: 'Shoutouts',
      polls: 'Polls',
      postAnnouncement: 'Post Announcement',
      givingShoutout: 'Give Shoutout',
      createPoll: 'Create Poll',
      viewAll: 'View All'
    },

    // Leaderboard
    leaderboard: {
      title: 'Leaderboard',
      rank: 'Rank',
      name: 'Name',
      xp: 'XP',
      level: 'Level',
      casesClosed: 'Cases Closed',
      checklistRate: 'Checklist Rate',
      thisWeek: 'This Week',
      thisMonth: 'This Month',
      allTime: 'All Time'
    },

    // Notifications
    notifications: {
      title: 'Notifications',
      caseAssigned: 'Case Assigned',
      stageChanged: 'Case Stage Changed',
      treatmentGap: 'Treatment Gap Detected',
      policeReportFlag: 'Police Report Pending',
      documentReceived: 'Document Received',
      badgeEarned: 'Badge Earned',
      teamPost: 'Team Activity',
      deadline: 'Deadline Coming Up',
      markAllRead: 'Mark All as Read',
      clear: 'Clear All'
    },

    // Badges
    badges: {
      title: 'Badges',
      earned: 'Badges Earned',
      xpReward: 'XP Reward',
      earnMore: 'Earn More Badges'
    },

    // Client Messages
    clientMessages: {
      insuranceRequest: 'Hello {clientName}, we need the insurance information for your case. Please provide the policy numbers and coverage details at your earliest convenience.',
      appointmentReminder: 'Hi {clientName}, reminder of your upcoming appointment on {date} at {time} with {clinic}. Please arrive 15 minutes early.',
      treatmentImportance: '{clientName}, continuing medical treatment is important for your case. Please schedule your next appointment as soon as possible.',
      biVsPdExplanation: 'Your case may involve both BI (Bodily Injury) coverage for medical expenses and PD (Property Damage) coverage for vehicle damage. We will pursue both.',
      policeReportFollowUp: 'We are still working to obtain the police report for your accident. This is important documentation for your case. We will update you once received.',
      lorSent: 'We have sent a Letter of Representation to {insuranceCompany}. This notifies them that we represent you in this matter.',
      treatmentGapAlert: 'There has been a gap of {days} days since your last treatment. Continuing treatment is important for your case.'
    },

    // Settings
    settings: {
      title: 'Settings',
      account: 'Account Settings',
      preferences: 'Preferences',
      notifications: 'Notification Preferences',
      language: 'Language',
      english: 'English',
      spanish: 'Spanish',
      theme: 'Theme',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
      privacy: 'Privacy',
      about: 'About',
      logout: 'Log Out'
    },

    // Validation
    validation: {
      required: 'This field is required',
      invalidEmail: 'Please enter a valid email',
      passwordTooShort: 'Password must be at least 8 characters',
      phoneInvalid: 'Please enter a valid phone number',
      caseNumberExists: 'This case number already exists',
      dateInvalid: 'Please enter a valid date'
    },

    // Messages
    messages: {
      caseSaved: 'Case saved successfully',
      caseDeleted: 'Case deleted',
      noteAdded: 'Note added',
      checklistCompleted: 'Checklist item marked as complete',
      noResults: 'No results found',
      confirmDelete: 'Are you sure you want to delete this?',
      unsavedChanges: 'You have unsaved changes'
    },

    // Intake Form
    intake: {
      title: 'New Case Intake',
      subtitle: 'Create a new case by entering client and accident details',
      newIntake: 'New Intake',
      submit: 'Create Case',
      success: 'Case created successfully!',
      step1: 'Client Information',
      step2: 'Accident Details',
      step3: 'Insurance Information',
      step4: 'Review & Submit',
      fields: {
        clientName: 'Client Full Name',
        phone: 'Phone Number',
        dob: 'Date of Birth',
        dateOfAccident: 'Date of Accident',
        state: 'State',
        zipCode: 'Zip Code',
        umPolicy: 'UM Policy Number',
        biInfo: 'BI Information',
        accidentDescription: 'Accident Description',
        opposingParty: 'Opposing Party',
        policeReport: 'Police Report Number'
      },
      warnings: {
        minorDetected: 'Minor Detected - Attorney Escalation Required',
        missingInsurance: 'Missing insurance info - will be flagged',
        noPoliceReport: 'If unavailable, case will be flagged for follow-up',
        txDefaults: 'TX Default Limits: BI $30,000 | PD $25,000'
      },
      caseNumber: 'Case Number',
      caseManager: 'Assigned Case Manager',
      language: 'Language Preference',
      optional: 'Optional'
    },

    // Rep Intake (the stripped-down 9-field "baby intake" form)
    repIntake: {
      headerTitle: 'Felicetti Team · Rep Intake',
      loggedInAs: 'Logged in as {name}',
      logout: 'Log out',
      newIntake: 'NEW INTAKE',
      resumingDraft: 'RESUMING DRAFT',
      pageTitle: 'Quick intake',
      pageSubtitle:
        "Capture the basics. A Case Manager will pick it up from the dashboard. Use {saveDraft} if the client can't finish right now.",
      drafts: {
        title: 'Your saved drafts',
        pending: '{count} pending',
        untitled: 'Untitled draft',
        savedAgo: 'Saved {time}',
        resume: 'Resume',
        discard: 'Discard draft'
      },
      fields: {
        fullName: 'Full Name',
        fullNamePlaceholder: 'John Doe',
        currentAddress: 'Current Address',
        currentAddressPlaceholder: '123 Main St, City, ST 00000',
        phone: 'Phone Number',
        phonePlaceholder: '(512) 555-0100',
        emergencyPhone: 'Emergency Contact Phone',
        emergencyPhonePlaceholder: '(512) 555-0200',
        email: 'Email Address',
        emailPlaceholder: 'client@email.com',
        dob: 'Date of Birth',
        ssn: 'Social Security #',
        ssnHelper: 'Only last 4 digits are shown',
        ssnPlaceholder: '***-**-0000',
        maritalStatus: 'Marital Status',
        select: 'Select...',
        countryOfBirth: 'Country of Birth',
        countryOfBirthPlaceholder: 'USA'
      },
      marital: {
        married: 'Married',
        single: 'Single',
        divorced: 'Divorced',
        neverMarried: 'Never Married'
      },
      attachments: {
        label: 'Attachments',
        optional: '(optional)'
      },
      buttons: {
        saveDraft: 'Save draft',
        updateDraft: 'Update draft',
        submit: 'Submit intake'
      },
      errors: {
        requiredFields: 'Please fill in the required fields marked with *.',
        fieldRequired: 'This field is required.',
        saveFailed: 'Save failed.',
        submitFailed: 'Submit failed.',
        deleteDraftFailed: 'Could not delete draft.',
        attachmentDraftFailed: 'Could not create a draft for the attachment.'
      },
      success: {
        eyebrow: 'INTAKE SUBMITTED',
        title: 'Sent to Ops.',
        body: "{name} is now on the Case Manager dashboard. They'll take it from here.",
        another: 'Submit another'
      }
    }
  },

  es: {
    // Navigation
    nav: {
      dashboard: 'Panel',
      cases: 'Casos',
      team: 'Equipo',
      settings: 'Configuración',
      notifications: 'Notificaciones',
      leaderboard: 'Tabla de Clasificación'
    },

    // Common
    common: {
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      add: 'Añadir',
      search: 'Buscar',
      filter: 'Filtrar',
      sort: 'Ordenar',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      close: 'Cerrar',
      back: 'Atrás',
      next: 'Siguiente',
      previous: 'Anterior',
      export: 'Exportar',
      import: 'Importar'
    },

    // User & Auth
    auth: {
      login: 'Iniciar Sesión',
      logout: 'Cerrar Sesión',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      rememberMe: 'Recuérdame',
      forgotPassword: 'Olvidé mi contraseña',
      signUp: 'Registrarse'
    },

    // Case Management
    cases: {
      title: 'Casos',
      newCase: 'Nuevo Caso',
      caseNumber: 'Número de Caso',
      clientName: 'Nombre del Cliente',
      clientPhone: 'Teléfono del Cliente',
      clientDob: 'Fecha de Nacimiento',
      dateOfAccident: 'Fecha del Accidente',
      state: 'Estado',
      zipCode: 'Código Postal',
      accidentDescription: 'Descripción del Accidente',
      opposingParty: 'Parte Contraria',
      policeReportNumber: 'Número de Informe Policial',
      stage: 'Etapa',
      assignedTo: 'Asignado a',
      notes: 'Notas',
      isUrgent: 'Es Urgente',
      isMinor: 'Es Menor de Edad',
      insurance: 'Información del Seguro',
      biPolicy: 'Límite de Póliza BI',
      pdPolicy: 'Límite de Póliza PD',
      umPolicy: 'Póliza UM/PIP',
      treatmentStatus: 'Estado del Tratamiento',
      notStarted: 'No Iniciado',
      inProgress: 'En Progreso',
      completed: 'Completado',
      gap: 'Brecha en Tratamiento',
      clinicInfo: 'Información de la Clínica',
      vehicleImpound: 'Fecha de Incautación del Vehículo',
      addNote: 'Añadir Nota',
      callLog: 'Registro de Llamadas',
      treatmentLog: 'Registro de Tratamiento',
      stageChange: 'Cambio de Etapa',
      closeCase: 'Cerrar Caso',
      reopenCase: 'Reapertura de Caso'
    },

    // Case Stages
    stages: {
      new_case: 'Caso Nuevo',
      trt: 'Tratamiento',
      liability: 'Responsabilidad',
      property_damage: 'Daño a la Propiedad',
      dem: 'Demanda',
      srl: 'Transacción/Litigio'
    },

    // Letters of Representation
    lor: {
      biLor: 'LOR de BI',
      umPipLor: 'LOR de UM/PIP',
      status: 'Estado de LOR',
      pending: 'Pendiente',
      sent: 'Enviado',
      received: 'Recibido',
      send: 'Enviar LOR',
      follow_up: 'Seguimiento'
    },

    // Police Report
    policeReport: {
      status: 'Estado del Informe Policial',
      obtain: 'Obtener Informe',
      pending: 'Pendiente',
      obtained: 'Obtenido',
      notNeeded: 'No Necesario',
      daysPending: 'Días Pendientes'
    },

    // Checklist
    checklist: {
      title: 'Lista de Verificación',
      intake: 'Admisión',
      treatment: 'Tratamiento',
      documentation: 'Documentación',
      liability: 'Responsabilidad',
      settlement: 'Transacción',
      addItem: 'Añadir Elemento',
      completeItem: 'Completar Elemento',
      incompleteRate: 'Tasa Incompleta',
      completionRate: 'Tasa de Finalización'
    },

    // Team
    team: {
      title: 'Equipo',
      members: 'Miembros del Equipo',
      announcements: 'Anuncios',
      celebrations: 'Celebraciones',
      shoutouts: 'Reconocimientos',
      polls: 'Encuestas',
      postAnnouncement: 'Publicar Anuncio',
      givingShoutout: 'Dar Reconocimiento',
      createPoll: 'Crear Encuesta',
      viewAll: 'Ver Todo'
    },

    // Leaderboard
    leaderboard: {
      title: 'Tabla de Clasificación',
      rank: 'Clasificación',
      name: 'Nombre',
      xp: 'XP',
      level: 'Nivel',
      casesClosed: 'Casos Cerrados',
      checklistRate: 'Tasa de Lista',
      thisWeek: 'Esta Semana',
      thisMonth: 'Este Mes',
      allTime: 'Todos los Tiempos'
    },

    // Notifications
    notifications: {
      title: 'Notificaciones',
      caseAssigned: 'Caso Asignado',
      stageChanged: 'Etapa del Caso Cambiada',
      treatmentGap: 'Brecha en Tratamiento Detectada',
      policeReportFlag: 'Informe Policial Pendiente',
      documentReceived: 'Documento Recibido',
      badgeEarned: 'Insignia Obtenida',
      teamPost: 'Actividad del Equipo',
      deadline: 'Próxima Fecha Límite',
      markAllRead: 'Marcar Todo como Leído',
      clear: 'Limpiar Todo'
    },

    // Badges
    badges: {
      title: 'Insignias',
      earned: 'Insignias Obtenidas',
      xpReward: 'Recompensa XP',
      earnMore: 'Obtener Más Insignias'
    },

    // Client Messages
    clientMessages: {
      insuranceRequest: 'Hola {clientName}, necesitamos la información del seguro para su caso. Por favor, proporcione los números de póliza y detalles de cobertura lo antes posible.',
      appointmentReminder: 'Hola {clientName}, recordatorio de su próxima cita el {date} a las {time} con {clinic}. Por favor, llegue 15 minutos antes.',
      treatmentImportance: '{clientName}, continuar con el tratamiento médico es importante para su caso. Por favor, programe su próxima cita lo antes posible.',
      biVsPdExplanation: 'Su caso puede involucrar tanto cobertura BI (Lesiones Corporales) para gastos médicos como cobertura PD (Daño a la Propiedad) para daño del vehículo. Perseguiremos ambas.',
      policeReportFollowUp: 'Todavía estamos trabajando para obtener el informe policial de su accidente. Esta es documentación importante para su caso. Lo actualizaremos una vez recibido.',
      lorSent: 'Hemos enviado una Carta de Representación a {insuranceCompany}. Esto les notifica que lo representamos en este asunto.',
      treatmentGapAlert: 'Ha habido una brecha de {days} días desde su último tratamiento. Continuar con el tratamiento es importante para su caso.'
    },

    // Settings
    settings: {
      title: 'Configuración',
      account: 'Configuración de Cuenta',
      preferences: 'Preferencias',
      notifications: 'Preferencias de Notificación',
      language: 'Idioma',
      english: 'Inglés',
      spanish: 'Español',
      theme: 'Tema',
      light: 'Claro',
      dark: 'Oscuro',
      system: 'Sistema',
      privacy: 'Privacidad',
      about: 'Acerca de',
      logout: 'Cerrar Sesión'
    },

    // Validation
    validation: {
      required: 'Este campo es obligatorio',
      invalidEmail: 'Por favor, ingrese un correo electrónico válido',
      passwordTooShort: 'La contraseña debe tener al menos 8 caracteres',
      phoneInvalid: 'Por favor, ingrese un número de teléfono válido',
      caseNumberExists: 'Este número de caso ya existe',
      dateInvalid: 'Por favor, ingrese una fecha válida'
    },

    // Messages
    messages: {
      caseSaved: 'Caso guardado correctamente',
      caseDeleted: 'Caso eliminado',
      noteAdded: 'Nota añadida',
      checklistCompleted: 'Elemento de lista marcado como completo',
      noResults: 'Sin resultados',
      confirmDelete: 'Estás seguro de que quieres eliminar esto?',
      unsavedChanges: 'Tienes cambios sin guardar'
    },

    // Intake Form
    intake: {
      title: 'Nueva Admisión de Caso',
      subtitle: 'Cree un nuevo caso ingresando los detalles del cliente y el accidente',
      newIntake: 'Nueva Admisión',
      submit: 'Crear Caso',
      success: 'Caso creado correctamente!',
      step1: 'Información del Cliente',
      step2: 'Detalles del Accidente',
      step3: 'Información de Seguros',
      step4: 'Revisar y Enviar',
      fields: {
        clientName: 'Nombre Completo del Cliente',
        phone: 'Número de Teléfono',
        dob: 'Fecha de Nacimiento',
        dateOfAccident: 'Fecha del Accidente',
        state: 'Estado',
        zipCode: 'Código Postal',
        umPolicy: 'Número de Póliza UM',
        biInfo: 'Información de BI',
        accidentDescription: 'Descripción del Accidente',
        opposingParty: 'Parte Contraria',
        policeReport: 'Número de Informe Policial'
      },
      warnings: {
        minorDetected: 'Menor Detectado - Se Requiere Escalación de Abogado',
        missingInsurance: 'Información de seguros faltante - será marcada',
        noPoliceReport: 'Si no está disponible, el caso será marcado para seguimiento',
        txDefaults: 'Límites Predeterminados de TX: BI $30,000 | PD $25,000'
      },
      caseNumber: 'Número de Caso',
      caseManager: 'Gerente de Caso Asignado',
      language: 'Preferencia de Idioma',
      optional: 'Opcional'
    },

    // Rep Intake (formulario simplificado de 9 campos - "baby intake")
    repIntake: {
      headerTitle: 'Equipo Felicetti · Admisión del Representante',
      loggedInAs: 'Sesión iniciada como {name}',
      logout: 'Cerrar sesión',
      newIntake: 'NUEVA ADMISIÓN',
      resumingDraft: 'CONTINUANDO BORRADOR',
      pageTitle: 'Admisión rápida',
      pageSubtitle:
        'Capture lo básico. Un Gerente de Caso lo retomará desde el panel. Use {saveDraft} si el cliente no puede terminar ahora.',
      drafts: {
        title: 'Sus borradores guardados',
        pending: '{count} pendientes',
        untitled: 'Borrador sin título',
        savedAgo: 'Guardado {time}',
        resume: 'Continuar',
        discard: 'Descartar borrador'
      },
      fields: {
        fullName: 'Nombre Completo',
        fullNamePlaceholder: 'Juan Pérez',
        currentAddress: 'Dirección Actual',
        currentAddressPlaceholder: 'Calle 123, Ciudad, ST 00000',
        phone: 'Número de Teléfono',
        phonePlaceholder: '(512) 555-0100',
        emergencyPhone: 'Teléfono de Contacto de Emergencia',
        emergencyPhonePlaceholder: '(512) 555-0200',
        email: 'Correo Electrónico',
        emailPlaceholder: 'cliente@correo.com',
        dob: 'Fecha de Nacimiento',
        ssn: 'Seguro Social',
        ssnHelper: 'Solo se muestran los últimos 4 dígitos',
        ssnPlaceholder: '***-**-0000',
        maritalStatus: 'Estado Civil',
        select: 'Seleccionar...',
        countryOfBirth: 'País de Nacimiento',
        countryOfBirthPlaceholder: 'EE.UU.'
      },
      marital: {
        married: 'Casado/a',
        single: 'Soltero/a',
        divorced: 'Divorciado/a',
        neverMarried: 'Nunca Casado/a'
      },
      attachments: {
        label: 'Archivos Adjuntos',
        optional: '(opcional)'
      },
      buttons: {
        saveDraft: 'Guardar borrador',
        updateDraft: 'Actualizar borrador',
        submit: 'Enviar admisión'
      },
      errors: {
        requiredFields: 'Por favor complete los campos requeridos marcados con *.',
        fieldRequired: 'Este campo es obligatorio.',
        saveFailed: 'Error al guardar.',
        submitFailed: 'Error al enviar.',
        deleteDraftFailed: 'No se pudo eliminar el borrador.',
        attachmentDraftFailed: 'No se pudo crear un borrador para el archivo adjunto.'
      },
      success: {
        eyebrow: 'ADMISIÓN ENVIADA',
        title: 'Enviada a Operaciones.',
        body: '{name} ya está en el panel del Gerente de Caso. Ellos se encargarán desde aquí.',
        another: 'Enviar otra'
      }
    }
  }
}

export type TranslationKeys = typeof translations
export type LanguageCode = keyof TranslationKeys
