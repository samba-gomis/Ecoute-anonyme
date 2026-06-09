/* ============================================
   shared-ui.js — Dark mode + Système i18n complet
   ============================================ */

const LANG = {
  fr: {
    /* ── Util bar ─────────────────────────────── */
    dark_label:'Sombre', light_label:'Clair', lang_toggle:'EN',

    /* ── Nav ──────────────────────────────────── */
    nav_projet:'Le projet', nav_comment:'Comment ça marche',
    nav_benevoles:'Bénévoles', nav_confidentialite:'Confidentialité', nav_cta:'Commencer',

    /* ── Footer ───────────────────────────────── */
    footer_copy:'© 2025 Écoute Anonyme · Tous droits réservés',
    footer_available:'Service disponible',
    footer_nav:'Navigation', footer_info:'Informations',
    footer_desc:"Un espace d'écoute bénévole, gratuit et confidentiel.",
    footer_home:'Accueil', footer_support:'Soutenir le projet',
    footer_contact:'Contact', footer_emergency:'Urgences : 3114',
    footer_volunteer:'Devenir bénévole',

    /* ── Index — Hero ─────────────────────────── */
    hero_badge:'Service gratuit · 100 % anonyme',
    hero_h1:'Un espace pour<br><em>s\'exprimer librement</em>',
    hero_sub:"Écoute Anonyme est un lieu sûr où vous pouvez parler sans jugement, sans dévoiler votre identité. Des bénévoles attentifs sont là pour vous écouter.",
    hero_cta:'Commencer à écrire', hero_learn:'En savoir plus',
    hero_note:'Aucune inscription · Aucune donnée personnelle',

    /* ── Index — Valeurs ──────────────────────── */
    values_label:'Nos fondements',
    values_title:'Trois piliers pour un <em>espace de confiance</em>',
    val_1_title:'Bénévolat',
    val_1_text:"Des personnes engagées qui offrent librement leur temps et leur écoute, sans aucune contrepartie.",
    val_2_title:'Confidentialité',
    val_2_text:"Aucune donnée personnelle exigée. Vos échanges vous appartiennent entièrement.",
    val_3_title:'Respect',
    val_3_text:"Un cadre bienveillant, sans jugement ni pression. Chaque personne est accueillie telle qu'elle est.",

    /* ── Index — Étapes ───────────────────────── */
    steps_label:'Le processus',
    steps_title:'Simple, <em>discret, sans engagement</em>',
    step_1_title:'Choisissez un pseudonyme',
    step_1_text:"Pas de nom réel, pas d'email. Juste un pseudo de votre choix, ou rien du tout.",
    step_2_title:'Choisissez un bénévole',
    step_2_text:"Parcourez les profils et choisissez la personne avec qui vous vous sentez à l'aise.",
    step_3_title:'Écrivez librement',
    step_3_text:"Exprimez-vous à votre rythme dans un espace sécurisé et confidentiel.",
    step_4_title:'Gardez le contrôle',
    step_4_text:"Conservez ou supprimez vos échanges à tout moment, comme vous le souhaitez.",

    /* ── Index — Engagements ──────────────────── */
    eng_label:'Nos engagements',
    eng_title:'Votre vie privée,<br><em>protégée avant tout</em>',
    eng_p1:"Écoute Anonyme est conçu dès sa fondation pour minimiser la collecte de données. Vous n'avez besoin de rien dévoiler pour bénéficier du service.",
    eng_p2:"Nous respectons le RGPD et allons au-delà de ses exigences : accès, rectification et effacement total garantis.",
    eng_btn:'Lire la charte complète',
    guar_1_title:'Aucune donnée personnelle obligatoire',
    guar_1_text:'Ni nom, ni email, ni téléphone. Un pseudonyme suffit.',
    guar_2_title:'Suppression immédiate possible',
    guar_2_text:'Vos conversations effacées définitivement à tout moment.',
    guar_3_title:'Zéro exploitation commerciale',
    guar_3_text:'Vos données ne sont jamais vendues, cédées ou partagées.',
    guar_4_title:'Échanges sécurisés',
    guar_4_text:'Protection technique contre tout accès non autorisé.',

    /* ── Index — Section bénévoles ────────────── */
    benv_sec_label:'Les bénévoles',
    benv_sec_title:'Des humains derrière <em>chaque réponse</em>',
    benv_sec_lead:"Ce ne sont pas des thérapeutes. Ce sont des personnes engagées, formées à l'écoute active, qui offrent une présence attentive et sans jugement.",
    benv_stat1_lbl:'Bénévoles', benv_stat2_lbl:'Service gratuit', benv_stat3_lbl:'Confidentialité',
    benv_warning:"<strong>Écoute Anonyme n'est pas un service d'urgence</strong> ni un dispositif médical. En cas de danger, contactez le 15, 17, 18 ou le 3114.",
    benv_sec_btn:"Découvrir l'équipe",

    /* ── Index — Avis ─────────────────────────── */
    reviews_label:'Témoignages',
    reviews_title:'Ce qu\'ils ont <em>vécu</em>',
    reviews_note:"Avis anonymes laissés en fin d'échange · Non reliés à une identité",

    /* ── Index — CTA ──────────────────────────── */
    cta_h2:'Prêt·e à <em>vous exprimer</em> ?',
    cta_p:"Aucune inscription. Aucun engagement. Juste un espace pour vous.",
    cta_btn:'Commencer maintenant',
    cta_note:'Service gratuit · Anonyme · Disponible maintenant',

    /* ── Présentation page ────────────────────── */
    bc_home:'Accueil', bc_project:'Le projet',
    page_pres_label:'Présentation',
    page_pres_h1:'Un espace pour<br><em>ceux qui en ont besoin</em>',
    page_pres_lead:"Écoute Anonyme est né d'une conviction simple : tout le monde mérite d'être entendu, sans conditions ni jugement.",
    vis_label:'Notre vision',
    vis_title:'Un lieu sûr pour<br><em>s\'exprimer librement</em>',
    vis_p1:"Écoute Anonyme est un espace d'écoute, d'échange et de soutien, fondé sur le bénévolat, la confidentialité et le respect de chacun.",
    vis_p2:"Ce projet a pour objectif d'offrir à toute personne qui en ressent le besoin un lieu sûr où elle peut s'exprimer librement, sans jugement, et en toute discrétion.",
    vis_p3:"Les échanges se font exclusivement par écrit, via un système de chat, permettant à l'utilisateur de rester anonyme grâce à l'utilisation d'un pseudonyme.",
    demo_bubble1:"Je n'ose pas en parler autour de moi, j'ai peur d'être jugé·e…",
    demo_meta1:'Utilisateur · via pseudonyme',
    demo_bubble2:"Je suis là pour vous écouter, sans aucun jugement. Vous pouvez me dire ce que vous ressentez.",
    demo_meta2:'Bénévole',
    demo_bubble3:"Merci… ça m'aide juste de savoir que quelqu'un est là.",
    demo_meta3:'Utilisateur',
    role_label:'Notre rôle',
    role_title:'De l\'écoute, pas<br><em>de la thérapie</em>',
    role_p1:"Chacun est libre de partager uniquement les informations qu'il souhaite, dans un cadre bienveillant et respectueux.",
    role_p2:'Les personnes qui répondent sont des <strong>bénévoles engagés</strong> dans une démarche d\'écoute, avec pour rôle d\'accompagner, soutenir et offrir une présence attentive — sans jugement ni pression.',
    role_alert:'<strong>Important :</strong> Écoute Anonyme n\'est pas un service d\'urgence, ni un dispositif médical ou thérapeutique. En cas de situation de danger ou d\'urgence, contactez le <strong>15</strong>, <strong>17</strong>, <strong>18</strong> ou le <strong>3114</strong> (numéro national de prévention du suicide).',
    role_list_title:'Ce que propose le service',
    role_nl_title:'Ce que le service n\'est pas',
    role_l1:"Un espace d'écoute bienveillant et sans jugement",
    role_l2:'Des échanges écrits avec un bénévole humain',
    role_l3:"Un anonymat total grâce à l'usage d'un pseudonyme",
    role_l4:'La liberté de partager ce que vous voulez, quand vous voulez',
    role_l5:'Un avis anonyme possible pour améliorer le service',
    role_nl1:"Un service d'urgence psychologique",
    role_nl2:'Un dispositif médical ou thérapeutique',
    role_nl3:'Un remplacement à un professionnel de santé',
    conf2_label:'Confidentialité',
    conf2_title:'Un haut niveau de<br><em>protection des données</em>',
    conf2_p1:"Écoute Anonyme garantit un niveau de confidentialité exceptionnel. Aucune donnée personnelle n'est exigée pour accéder au service.",
    conf2_p2:"Les conversations ne sont pas exploitées à des fins commerciales. L'utilisateur garde le contrôle total sur ses échanges, avec la possibilité de les supprimer définitivement ou de les conserver.",
    conf2_p3:"À la fin de chaque échange, un avis anonyme peut être laissé pour contribuer à l'amélioration du service — sans jamais être relié à votre identité ou à votre conversation.",
    conf2_btn:'Lire la charte complète',
    vis_d1_title:'Aucune donnée personnelle', vis_d1_text:"Pas de nom, d'email ou de téléphone requis",
    vis_d2_title:'Suppression à la demande', vis_d2_text:'Vos données effacées immédiatement sur demande',
    vis_d3_title:'Échanges sécurisés', vis_d3_text:'Protection technique contre tout accès non autorisé',
    vis_d4_title:'Conformité RGPD', vis_d4_text:"Droits d'accès, de rectification et d'effacement garantis",
    sout2_label:'Soutenir le projet',
    sout2_title:'Gratuit, mais pas <em>sans effort</em>',
    sout2_p:"Le service est entièrement gratuit. Une option facultative permet à ceux qui le souhaitent de contribuer à la pérennité du projet — sans aucune obligation ni contrepartie.",
    sout2_btn1:'Faire un don', sout2_btn2:'Devenir bénévole',
    pres_cta_h2:'Vous avez besoin<br>d\'<em>être écouté·e</em> ?',
    pres_cta_p:'Rejoignez la conversation, en toute discrétion et sans engagement.',
    pres_cta_btn:'Commencer maintenant',

    /* ── Bénévoles page ───────────────────────── */
    bc_volunteers:'Bénévoles',
    page_benv_label:'Espace bénévoles',
    page_benv_h1:'Rejoindre<br><em>l\'équipe d\'écoute</em>',
    page_benv_lead:"Nos bénévoles sont le cœur d'Écoute Anonyme. Découvrez l'équipe ou proposez votre candidature.",
    tab_liste:"L'équipe actuelle", tab_inscr:"Devenir bénévole",
    benv_intro_label:'Bénévoles actifs',
    benv_intro_title:'Des personnes <em>engagées</em> pour vous écouter',
    benv_intro_text:"Chaque bénévole a été validé par notre équipe et a accepté la charte d'éthique. Ils offrent leur temps librement, sans contrepartie.",
    proc_step1_title:'Candidature', proc_step1_text:'Remplissez le formulaire avec vos motivations et disponibilités.',
    proc_step2_title:'Examen', proc_step2_text:'Notre équipe examine votre demande sous 5 à 10 jours ouvrés.',
    proc_step3_title:'Validation', proc_step3_text:"Si accepté·e, vous recevez un email d'accès à l'espace bénévole.",
    proc_step4_title:'Écoute', proc_step4_text:'Vous apparaissez dans la liste et pouvez commencer à écouter.',
    form_title:'Votre <em>candidature</em>',
    form_intro:'Tous les champs marqués <span style="color:var(--sage)">*</span> sont obligatoires. Votre adresse email sera utilisée uniquement pour vous informer de la décision.',
    form_lbl_prenom:'Prénom', form_lbl_nom:'Nom', form_lbl_email:'Adresse email',
    form_lbl_pseudo:'Pseudo bénévole', form_lbl_motivation:'Vos motivations',
    form_lbl_desc:'Courte description (visible par les utilisateurs)',
    form_lbl_domaine:"Domaines d'écoute privilégiés",
    form_lbl_dispo:'Disponibilités', form_lbl_charte:'Charte du bénévole',
    form_submit:'Envoyer ma candidature',
    form_pl_prenom:'Votre prénom', form_pl_nom:'Votre nom',
    form_pl_email:'votre@email.com',
    form_pl_pseudo:'Nom qui apparaîtra dans la liste (ex : Marie, Lucie…)',
    form_pl_motivation:"Pourquoi souhaitez-vous devenir bénévole ? Quelle expérience ou sensibilité vous amène vers ce type d'écoute ?",
    form_pl_desc:'Ex : Bénévole passionné·e par l\'écoute active, disponible le soir',
    dispo_matin:'Matin (8h–12h)', dispo_aprem:'Après-midi (12h–18h)',
    dispo_soir:'Soir (18h–22h)', dispo_wknd:'Week-end',
    charte_accept:"J'ai lu et j'accepte la charte du bénévole. Je m'engage à la respecter scrupuleusement.",

    /* ── Confidentialité page ─────────────────── */
    bc_privacy:'Confidentialité',
    page_conf_label:'Protection des données',
    page_conf_h1:'Charte de <em>confidentialité</em>',
    page_conf_lead:"Écoute Anonyme s'engage à respecter la réglementation en vigueur, notamment le Règlement Général sur la Protection des Données (RGPD).",
    conf_updated:'Conforme RGPD · Dernière mise à jour : 2025',
    conf_summary_title:'En résumé',
    conf_sum1_title:'Aucune donnée obligatoire', conf_sum1_text:"Pas de nom, d'email ni de téléphone requis.",
    conf_sum2_title:'Suppression immédiate', conf_sum2_text:'Vos conversations effacées à tout moment sur demande.',
    conf_sum3_title:'Zéro vente de données', conf_sum3_text:'Aucune donnée vendue, cédée ou partagée avec des tiers.',
    conf_sum4_title:'Conforme RGPD', conf_sum4_text:"Vos droits d'accès, rectification et effacement garantis.",
    conf_toc:'Sommaire',
    conf_nav1:'Données collectées', conf_nav2:'Finalité',
    conf_nav3:'Durée de conservation', conf_nav4:'Sécurité',
    conf_nav5:'Partage des données', conf_nav6:'Vos droits',
    conf_nav7:'Limite & anonymat', conf_nav8:'Évolution',
    conf_art1_title:'Données collectées',
    conf_art1_p1:'Le service est conçu pour minimiser au maximum la collecte de données personnelles. Notre approche repose sur le principe de <em>privacy by design</em> : nous ne collectons que ce qui est strictement nécessaire au bon fonctionnement de l\'écoute.',
    conf_never:'Ce que nous ne demandons jamais :',
    conf_only:'Les seules données susceptibles d\'être traitées :',
    conf_art2_title:'Finalité des données',
    conf_art2_p1:'Les données collectées sont utilisées <strong>exclusivement</strong> dans le cadre du service d\'écoute. Aucune exploitation à des fins commerciales, publicitaires ou analytiques n\'est réalisée.',
    conf_art3_title:'Durée de conservation',
    conf_art3_p1:'Vous avez un contrôle total sur la durée de conservation de vos données. Aucune rétention automatique prolongée n\'est effectuée sans votre accord.',
    conf_art4_title:'Sécurité',
    conf_art4_p1:'Des mesures techniques appropriées sont mises en place pour protéger vos données contre tout accès, modification, divulgation ou destruction non autorisés.',
    conf_art5_title:'Partage des données',
    conf_art5_p1:'Écoute Anonyme ne partage, ne vend et ne cède aucune donnée personnelle à des tiers, quelles que soient les circonstances.',
    conf_art6_title:'Vos droits',
    conf_art6_p1:'Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants sur vos données personnelles :',
    conf_art6_p2:'Ces droits peuvent être exercés à tout moment, dans la limite du fonctionnement anonyme du service.',
    conf_right1:"Droit d'accès", conf_right2:'Droit de rectification',
    conf_right3:"Droit à l'effacement", conf_right4:'Droit à la limitation',
    conf_art7_title:"Limite liée à l'anonymat",
    conf_art7_p1:'En raison du fonctionnement intrinsèquement anonyme du service, certaines demandes liées à l\'exercice de vos droits peuvent présenter des contraintes pratiques.',
    conf_limit:'<strong>Note importante :</strong> Certaines demandes — par exemple la récupération de données sans identifiant ou pseudonyme — peuvent ne pas être techniquement réalisables. Ce fonctionnement est une conséquence directe de notre engagement envers votre anonymat.',
    conf_art8_title:'Évolution de la politique',
    conf_art8_p1:'La présente politique de confidentialité peut être amenée à évoluer, notamment pour rester conforme aux obligations légales en vigueur ou pour intégrer de nouvelles bonnes pratiques.',
    conf_art8_p2:'En cas de modification substantielle, les utilisateurs actifs seront informés par un message visible lors de leur prochaine connexion. La date de dernière mise à jour est toujours indiquée en haut de ce document.',
    conf_contact_h3:'Une question sur vos données ?',
    conf_contact_p:'Nous répondons à toute demande liée à la protection de vos données dans les meilleurs délais.',
    conf_contact_btn:'Nous contacter',

    /* ── Chat page ────────────────────────────── */
    chat_step_label:'Étape 2 / 2',
    chat_entry_h1:'Bienvenue.<br><em>Vous n\'êtes pas seul·e.</em>',
    chat_entry_desc:"Choisissez un pseudonyme ou entrez anonymement. Aucune information personnelle n'est requise.",
    chat_entry_label:'Votre pseudonyme (optionnel)',
    chat_entry_pl:'Ex : Fleur, Anonyme42, Voyageur…',
    chat_btn_vol:'Choisir un bénévole',
    chat_btn_anon:'Entrer sans pseudonyme',
    chat_notice:'Anonymat total · Aucune donnée collectée',
    chat_notice_link:'Charte de confidentialité',
    chat_vol_h2:'Choisissez <em>votre bénévole</em>',
    chat_vol_p:'Tous validés et engagés dans notre charte éthique.',
    chat_back:'Retour',
    chat_sys_msg:'Vous êtes connecté·e à un bénévole. Espace confidentiel et bienveillant.',
    chat_input_pl:'Écrivez votre message…',
    chat_input_hint:'Entrée pour envoyer · Maj+Entrée pour un saut de ligne',
    dd_review:'Laisser un avis', dd_end:"Terminer l'échange",
    modal_review_title:'Laisser un avis anonyme',
    modal_review_p:"Jamais relié à votre identité. Aide uniquement à améliorer le service.",
    modal_review_pl:'Un commentaire ? (optionnel)',
    modal_review_skip:'Passer', modal_review_send:'Envoyer',
    modal_report_title:'Signaler ce bénévole',
    modal_report_p:'Notre équipe sera immédiatement alertée et examinera le signalement.',
    modal_report_cancel:'Annuler', modal_report_submit:'Signaler',
    rep_opt1:"A demandé de l'argent",
    rep_opt2:'A demandé des informations personnelles',
    rep_opt3:'A proposé un contact hors plateforme',
    rep_opt4:'Comportement inapproprié', rep_opt5:'Autre motif',
    modal_end_title:"Terminer l'échange",
    modal_end_info:'Souhaitez-vous conserver cette conversation ou la supprimer définitivement ?',
    modal_end_keep_title:'Conserver la conversation',
    modal_end_keep_p:'Vos messages restent accessibles lors de vos prochaines visites.',
    modal_end_del_title:'Supprimer définitivement',
    modal_end_del_p:'Tous vos messages seront effacés de façon irréversible.',
    modal_end_cancel:'Annuler', modal_end_confirm:'Continuer',
    modal_don_title:"Soutenir l'association",
    modal_don_p:"Ce service est entièrement gratuit et bénévole. Si vous souhaitez contribuer à sa pérennité, c'est possible — mais absolument pas obligatoire.",
    modal_don_btn:'Faire un don', modal_don_skip:'Non merci, terminer',
    modal_repok_title:'Signalement envoyé',
    modal_repok_p:'Notre équipe examinera votre signalement dans les meilleurs délais. Merci.',
    modal_repok_btn:'Fermer',

    /* ── Soutenir page ────────────────────────── */
    bc_support:'Soutenir',
    page_sout_label:'Faire un don',
    page_sout_h1:'Soutenir <em>Écoute Anonyme</em>',
    page_sout_lead:"Le service est 100 % gratuit. Votre soutien aide à couvrir les frais techniques et à pérenniser l'initiative. Aucune obligation.",
    don_amount_label:'Choisir un montant',
    don_custom_pl:'Montant personnalisé (€)',
    don_method_label:'Méthode de paiement',
    don_m1_title:'Carte bancaire', don_m1_sub:'Visa, Mastercard, CB',
    don_m2_title:'PayPal', don_m2_sub:'Payer avec votre compte PayPal',
    don_m3_title:'Apple Pay', don_m3_sub:'Paiement rapide et sécurisé',
    don_card_num:'Numéro de carte', don_card_exp:"Date d'expiration", don_card_cvv:'Code de sécurité',
    don_card_num_pl:'1234 5678 9012 3456', don_card_exp_pl:'MM / AA', don_card_cvv_pl:'CVV',
    priv_b1:'Paiement sécurisé', priv_b2:'Données non conservées', priv_b3:'Anonyme',
    don_sum_title:'Votre don',
    don_sum_amount:'Montant', don_sum_method:'Méthode', don_sum_fees:'Frais', don_sum_total:'Total',
    don_sum_method_none:'Non sélectionnée', don_sum_fees_val:'0€',
    don_note:"Vos coordonnées bancaires ne sont jamais stockées sur nos serveurs. Le paiement est traité par un prestataire certifié PCI-DSS. Vous pouvez faire un don de façon totalement anonyme.",
    don_btn:'Valider le don',
    don_no_engage:'Sans engagement · Remboursable sur demande',
    don_impact_label:'Impact de votre don',
    don_impact_title:'Ce que vous <em>rendez possible</em>',
    impact_1_text:"Couvre 1 mois d'hébergement sécurisé pour la plateforme",
    impact_2_text:'Finance la formation continue de 2 bénévoles',
    impact_3_text:"Permet d'accueillir 50 nouvelles personnes sur la plateforme",
    confirm_title:'Merci pour votre soutien !',
    confirm_p:"Votre don a bien été pris en compte. Il contribue directement à maintenir ce service gratuit et accessible à tous.",
    confirm_btn:"Retourner à l'accueil",
  },

  en: {
    /* ── Util bar ─────────────────────────────── */
    dark_label:'Dark', light_label:'Light', lang_toggle:'FR',

    /* ── Nav ──────────────────────────────────── */
    nav_projet:'The project', nav_comment:'How it works',
    nav_benevoles:'Volunteers', nav_confidentialite:'Privacy', nav_cta:'Start',

    /* ── Footer ───────────────────────────────── */
    footer_copy:'© 2025 Écoute Anonyme · All rights reserved',
    footer_available:'Service available',
    footer_nav:'Navigation', footer_info:'Information',
    footer_desc:'A free, confidential volunteer listening service.',
    footer_home:'Home', footer_support:'Support us',
    footer_contact:'Contact', footer_emergency:'Emergency: 3114',
    footer_volunteer:'Become a volunteer',

    /* ── Index — Hero ─────────────────────────── */
    hero_badge:'Free service · 100% anonymous',
    hero_h1:'A space to<br><em>express yourself freely</em>',
    hero_sub:"Écoute Anonyme is a safe place where you can talk without judgment, without revealing your identity. Attentive volunteers are here to listen.",
    hero_cta:'Start writing', hero_learn:'Learn more',
    hero_note:'No registration · No personal data',

    /* ── Index — Valeurs ──────────────────────── */
    values_label:'Our foundations',
    values_title:'Three pillars for a <em>space of trust</em>',
    val_1_title:'Volunteering',
    val_1_text:"Committed people who freely offer their time and attention, with nothing expected in return.",
    val_2_title:'Confidentiality',
    val_2_text:"No personal data required. Your exchanges belong entirely to you.",
    val_3_title:'Respect',
    val_3_text:"A caring, judgment-free environment. Every person is welcomed as they are.",

    /* ── Index — Étapes ───────────────────────── */
    steps_label:'The process',
    steps_title:'Simple, <em>discreet, no commitment</em>',
    step_1_title:'Choose a username',
    step_1_text:"No real name, no email. Just a username of your choice — or nothing at all.",
    step_2_title:'Choose a volunteer',
    step_2_text:"Browse profiles and choose the person you feel most comfortable with.",
    step_3_title:'Write freely',
    step_3_text:"Express yourself at your own pace in a secure and confidential space.",
    step_4_title:'Stay in control',
    step_4_text:"Keep or delete your exchanges at any time, however you wish.",

    /* ── Index — Engagements ──────────────────── */
    eng_label:'Our commitments',
    eng_title:'Your privacy,<br><em>protected above all</em>',
    eng_p1:"Écoute Anonyme was designed from the ground up to minimize data collection. You don't need to reveal anything to use the service.",
    eng_p2:"We comply with GDPR and go beyond its requirements: access, rectification, and complete deletion guaranteed.",
    eng_btn:'Read the full charter',
    guar_1_title:'No personal data required',
    guar_1_text:'No name, email, or phone. A username is enough.',
    guar_2_title:'Immediate deletion possible',
    guar_2_text:'Your conversations permanently deleted at any time.',
    guar_3_title:'Zero commercial use',
    guar_3_text:'Your data is never sold, transferred, or shared.',
    guar_4_title:'Secured exchanges',
    guar_4_text:'Technical protection against any unauthorized access.',

    /* ── Index — Section bénévoles ────────────── */
    benv_sec_label:'The volunteers',
    benv_sec_title:'Humans behind <em>every response</em>',
    benv_sec_lead:"They are not therapists. They are committed people, trained in active listening, who offer attentive, non-judgmental presence.",
    benv_stat1_lbl:'Volunteers', benv_stat2_lbl:'Free service', benv_stat3_lbl:'Confidentiality',
    benv_warning:"<strong>Écoute Anonyme is not an emergency service</strong> nor a medical device. In case of danger, contact 15, 17, 18 or 3114.",
    benv_sec_btn:"Meet the team",

    /* ── Index — Avis ─────────────────────────── */
    reviews_label:'Testimonials',
    reviews_title:'What they <em>experienced</em>',
    reviews_note:"Anonymous reviews left at the end of each session · Not linked to any identity",

    /* ── Index — CTA ──────────────────────────── */
    cta_h2:'Ready to <em>express yourself</em>?',
    cta_p:"No registration. No commitment. Just a space for you.",
    cta_btn:'Start now',
    cta_note:'Free service · Anonymous · Available now',

    /* ── Présentation page ────────────────────── */
    bc_home:'Home', bc_project:'The project',
    page_pres_label:'Presentation',
    page_pres_h1:'A space for<br><em>those who need it</em>',
    page_pres_lead:"Écoute Anonyme was born from a simple conviction: everyone deserves to be heard, without conditions or judgment.",
    vis_label:'Our vision',
    vis_title:'A safe place to<br><em>express yourself freely</em>',
    vis_p1:"Écoute Anonyme is a space for listening, exchange and support, founded on volunteering, confidentiality and respect for each person.",
    vis_p2:"This project aims to offer anyone who needs it a safe place where they can express themselves freely, without judgment, and in complete discretion.",
    vis_p3:"All exchanges take place exclusively in writing, via a chat system, allowing users to remain anonymous through the use of a username.",
    demo_bubble1:"I don't dare talk about it around me, I'm afraid of being judged…",
    demo_meta1:'User · via username',
    demo_bubble2:"I'm here to listen to you, without any judgment. You can tell me how you feel.",
    demo_meta2:'Volunteer',
    demo_bubble3:"Thank you… it helps just to know someone is here.",
    demo_meta3:'User',
    role_label:'Our role',
    role_title:'Listening, not<br><em>therapy</em>',
    role_p1:'Everyone is free to share only the information they wish, in a caring and respectful environment.',
    role_p2:'The people who respond are <strong>committed volunteers</strong> engaged in a listening approach, whose role is to accompany, support and offer attentive presence — without judgment or pressure.',
    role_alert:'<strong>Important:</strong> Écoute Anonyme is not an emergency service, nor a medical or therapeutic device. In case of emergency, contact <strong>15</strong>, <strong>17</strong>, <strong>18</strong> or <strong>3114</strong> (national suicide prevention line).',
    role_list_title:'What the service offers',
    role_nl_title:'What the service is not',
    role_l1:'A caring, judgment-free listening space',
    role_l2:'Written exchanges with a human volunteer',
    role_l3:'Total anonymity through the use of a username',
    role_l4:'Freedom to share what you want, when you want',
    role_l5:'An anonymous review option to improve the service',
    role_nl1:'A psychological emergency service',
    role_nl2:'A medical or therapeutic device',
    role_nl3:'A replacement for a healthcare professional',
    conf2_label:'Confidentiality',
    conf2_title:'A high level of<br><em>data protection</em>',
    conf2_p1:"Écoute Anonyme guarantees an exceptional level of confidentiality. No personal data is required to access the service.",
    conf2_p2:"Conversations are not exploited for commercial purposes. Users retain full control over their exchanges, with the ability to permanently delete or keep them.",
    conf2_p3:"At the end of each exchange, an anonymous review can be left to help improve the service — without ever being linked to your identity or conversation.",
    conf2_btn:'Read the full charter',
    vis_d1_title:'No personal data', vis_d1_text:'No name, email or phone required',
    vis_d2_title:'Deletion on request', vis_d2_text:'Your data deleted immediately upon request',
    vis_d3_title:'Secured exchanges', vis_d3_text:'Technical protection against unauthorized access',
    vis_d4_title:'GDPR compliance', vis_d4_text:'Rights of access, rectification and erasure guaranteed',
    sout2_label:'Support the project',
    sout2_title:'Free, but not <em>effortless</em>',
    sout2_p:"The service is entirely free. An optional contribution allows those who wish to support the project's sustainability — with no obligation.",
    sout2_btn1:'Make a donation', sout2_btn2:'Become a volunteer',
    pres_cta_h2:'Do you need<br>to be <em>heard</em>?',
    pres_cta_p:'Join the conversation, in complete discretion and without commitment.',
    pres_cta_btn:'Start now',

    /* ── Bénévoles page ───────────────────────── */
    bc_volunteers:'Volunteers',
    page_benv_label:'Volunteer space',
    page_benv_h1:'Join<br><em>the listening team</em>',
    page_benv_lead:"Our volunteers are the heart of Écoute Anonyme. Discover the team or submit your application.",
    tab_liste:'Current team', tab_inscr:'Become a volunteer',
    benv_intro_label:'Active volunteers',
    benv_intro_title:'Committed people <em>here to listen</em>',
    benv_intro_text:"Each volunteer has been validated by our team and accepted the ethics charter. They offer their time freely, without compensation.",
    proc_step1_title:'Application', proc_step1_text:'Fill in the form with your motivations and availability.',
    proc_step2_title:'Review', proc_step2_text:'Our team reviews your application within 5 to 10 business days.',
    proc_step3_title:'Validation', proc_step3_text:'If accepted, you receive an email with access to the volunteer space.',
    proc_step4_title:'Listening', proc_step4_text:'You appear in the list and can start listening.',
    form_title:'Your <em>application</em>',
    form_intro:'All fields marked <span style="color:var(--sage)">*</span> are required. Your email will only be used to inform you of the decision.',
    form_lbl_prenom:'First name', form_lbl_nom:'Last name', form_lbl_email:'Email address',
    form_lbl_pseudo:'Volunteer username', form_lbl_motivation:'Your motivations',
    form_lbl_desc:'Short description (visible to users)',
    form_lbl_domaine:'Preferred listening areas',
    form_lbl_dispo:'Availability', form_lbl_charte:'Volunteer charter',
    form_submit:'Send my application',
    form_pl_prenom:'Your first name', form_pl_nom:'Your last name',
    form_pl_email:'your@email.com',
    form_pl_pseudo:'Name shown in the list (e.g. Marie, Lucie…)',
    form_pl_motivation:'Why do you want to become a volunteer? What experience or sensitivity brings you to this type of listening?',
    form_pl_desc:'E.g. Volunteer passionate about active listening, available in the evenings',
    dispo_matin:'Morning (8am–12pm)', dispo_aprem:'Afternoon (12pm–6pm)',
    dispo_soir:'Evening (6pm–10pm)', dispo_wknd:'Weekend',
    charte_accept:"I have read and accept the volunteer charter. I commit to following it scrupulously.",

    /* ── Confidentialité page ─────────────────── */
    bc_privacy:'Privacy',
    page_conf_label:'Data protection',
    page_conf_h1:'Privacy <em>policy</em>',
    page_conf_lead:"Écoute Anonyme is committed to complying with applicable regulations, in particular the General Data Protection Regulation (GDPR).",
    conf_updated:'GDPR compliant · Last updated: 2025',
    conf_summary_title:'In summary',
    conf_sum1_title:'No data required', conf_sum1_text:'No name, email or phone required.',
    conf_sum2_title:'Immediate deletion', conf_sum2_text:'Your conversations deleted at any time on request.',
    conf_sum3_title:'Zero data sales', conf_sum3_text:'No data sold, transferred or shared with third parties.',
    conf_sum4_title:'GDPR compliant', conf_sum4_text:'Rights of access, rectification and erasure guaranteed.',
    conf_toc:'Contents',
    conf_nav1:'Data collected', conf_nav2:'Purpose',
    conf_nav3:'Retention period', conf_nav4:'Security',
    conf_nav5:'Data sharing', conf_nav6:'Your rights',
    conf_nav7:'Limits & anonymity', conf_nav8:'Policy updates',
    conf_art1_title:'Data collected',
    conf_art1_p1:'The service is designed to minimize data collection. Our approach is based on the principle of <em>privacy by design</em>: we only collect what is strictly necessary for the listening service to function.',
    conf_never:'What we never ask for:',
    conf_only:'The only data that may be processed:',
    conf_art2_title:'Purpose of data',
    conf_art2_p1:'The data collected is used <strong>exclusively</strong> for the listening service. No exploitation for commercial, advertising or analytical purposes is carried out.',
    conf_art3_title:'Retention period',
    conf_art3_p1:'You have full control over the retention period of your data. No extended automatic retention is carried out without your consent.',
    conf_art4_title:'Security',
    conf_art4_p1:'Appropriate technical measures are in place to protect your data against unauthorized access, modification, disclosure or destruction.',
    conf_art5_title:'Data sharing',
    conf_art5_p1:'Écoute Anonyme does not share, sell or transfer any personal data to third parties under any circumstances.',
    conf_art6_title:'Your rights',
    conf_art6_p1:'In accordance with the General Data Protection Regulation (GDPR), you have the following rights over your personal data:',
    conf_art6_p2:'These rights may be exercised at any time, within the limits of the anonymous operation of the service.',
    conf_right1:'Right of access', conf_right2:'Right of rectification',
    conf_right3:'Right to erasure', conf_right4:'Right to restriction',
    conf_art7_title:'Limits related to anonymity',
    conf_art7_p1:'Due to the inherently anonymous nature of the service, certain requests related to the exercise of your rights may present practical constraints.',
    conf_limit:'<strong>Important note:</strong> Some requests — for example recovering data without an identifier or username — may not be technically feasible. This is a direct consequence of our commitment to your anonymity.',
    conf_art8_title:'Policy updates',
    conf_art8_p1:'This privacy policy may be updated to remain compliant with applicable legal obligations or to incorporate new best practices.',
    conf_art8_p2:'In the event of a significant change, active users will be notified by a visible message at their next login. The date of the last update is always indicated at the top of this document.',
    conf_contact_h3:'A question about your data?',
    conf_contact_p:'We respond to any data protection request as quickly as possible.',
    conf_contact_btn:'Contact us',

    /* ── Chat page ────────────────────────────── */
    chat_step_label:'Step 2 / 2',
    chat_entry_h1:'Welcome.<br><em>You are not alone.</em>',
    chat_entry_desc:'Choose a username or enter anonymously. No personal information is required.',
    chat_entry_label:'Your username (optional)',
    chat_entry_pl:'E.g. Flower, Anonymous42, Traveler…',
    chat_btn_vol:'Choose a volunteer',
    chat_btn_anon:'Enter without a username',
    chat_notice:'Complete anonymity · No data collected',
    chat_notice_link:'Privacy policy',
    chat_vol_h2:'Choose <em>your volunteer</em>',
    chat_vol_p:'All validated and committed to our ethics charter.',
    chat_back:'Back',
    chat_sys_msg:'You are connected to a volunteer. Confidential and caring space.',
    chat_input_pl:'Write your message…',
    chat_input_hint:'Enter to send · Shift+Enter for a new line',
    dd_review:'Leave a review', dd_end:'End the session',
    modal_review_title:'Leave an anonymous review',
    modal_review_p:'Never linked to your identity. Only helps improve the service.',
    modal_review_pl:'A comment? (optional)',
    modal_review_skip:'Skip', modal_review_send:'Send',
    modal_report_title:'Report this volunteer',
    modal_report_p:'Our team will be immediately alerted and will review the report.',
    modal_report_cancel:'Cancel', modal_report_submit:'Report',
    rep_opt1:'Asked for money',
    rep_opt2:'Asked for personal information',
    rep_opt3:'Suggested contact outside the platform',
    rep_opt4:'Inappropriate behavior', rep_opt5:'Other reason',
    modal_end_title:'End the session',
    modal_end_info:'Would you like to keep this conversation or permanently delete it?',
    modal_end_keep_title:'Keep the conversation',
    modal_end_keep_p:'Your messages will remain accessible on your next visits.',
    modal_end_del_title:'Permanently delete',
    modal_end_del_p:'All your messages will be irreversibly erased.',
    modal_end_cancel:'Cancel', modal_end_confirm:'Continue',
    modal_don_title:'Support the association',
    modal_don_p:"This service is entirely free and volunteer-run. If you'd like to contribute to its sustainability, you can — but it's absolutely not required.",
    modal_don_btn:'Make a donation', modal_don_skip:'No thanks, finish',
    modal_repok_title:'Report sent',
    modal_repok_p:'Our team will review your report as soon as possible. Thank you.',
    modal_repok_btn:'Close',

    /* ── Soutenir page ────────────────────────── */
    bc_support:'Support',
    page_sout_label:'Make a donation',
    page_sout_h1:'Support <em>Écoute Anonyme</em>',
    page_sout_lead:"The service is 100% free. Your support helps cover technical costs and sustain the initiative. No obligation.",
    don_amount_label:'Choose an amount',
    don_custom_pl:'Custom amount (€)',
    don_method_label:'Payment method',
    don_m1_title:'Bank card', don_m1_sub:'Visa, Mastercard, CB',
    don_m2_title:'PayPal', don_m2_sub:'Pay with your PayPal account',
    don_m3_title:'Apple Pay', don_m3_sub:'Fast and secure payment',
    don_card_num:'Card number', don_card_exp:'Expiry date', don_card_cvv:'Security code',
    don_card_num_pl:'1234 5678 9012 3456', don_card_exp_pl:'MM / YY', don_card_cvv_pl:'CVV',
    priv_b1:'Secure payment', priv_b2:'Data not stored', priv_b3:'Anonymous',
    don_sum_title:'Your donation',
    don_sum_amount:'Amount', don_sum_method:'Method', don_sum_fees:'Fees', don_sum_total:'Total',
    don_sum_method_none:'Not selected', don_sum_fees_val:'€0',
    don_note:"Your bank details are never stored on our servers. Payment is processed by a PCI-DSS certified provider. You can donate completely anonymously.",
    don_btn:'Confirm donation',
    don_no_engage:'No commitment · Refundable on request',
    don_impact_label:'Impact of your donation',
    don_impact_title:'What you <em>make possible</em>',
    impact_1_text:'Covers 1 month of secure hosting for the platform',
    impact_2_text:'Funds ongoing training for 2 volunteers',
    impact_3_text:'Allows 50 new people to join the platform',
    confirm_title:'Thank you for your support!',
    confirm_p:"Your donation has been received. It directly contributes to keeping this service free and accessible to all.",
    confirm_btn:'Return to home',
  }
};

let currentLang = localStorage.getItem('ea-lang') || 'fr';
let isDark = localStorage.getItem('ea-dark') === '1';

function injectUtilBar() {
  const bar = document.createElement('div');
  bar.className = 'util-bar';
  bar.id = 'util-bar';
  bar.innerHTML = `
    <span class="util-label" id="util-mode-label"></span>
    <div class="dark-toggle" id="dark-toggle" onclick="toggleDark()" title="Mode sombre / clair">
      <div class="dark-toggle-knob"></div>
    </div>
    <span class="util-sep"></span>
    <button class="util-btn" id="lang-btn" onclick="toggleLang()"></button>
  `;
  document.body.prepend(bar);
}

function applyDark() {
  document.body.classList.toggle('dark', isDark);
  const t = document.getElementById('dark-toggle');
  const l = document.getElementById('util-mode-label');
  if (t) t.classList.toggle('on', isDark);
  if (l) l.textContent = isDark ? LANG[currentLang].dark_label : LANG[currentLang].light_label;
  localStorage.setItem('ea-dark', isDark ? '1' : '0');
}

function toggleDark() { isDark = !isDark; applyDark(); }

function applyLang() {
  const t = LANG[currentLang];

  // data-i18n → textContent
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.getAttribute('data-i18n');
    if (t[k] === undefined) return;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = t[k];
    else el.textContent = t[k];
  });

  // data-i18n-html → innerHTML (titres avec <em>, alertes avec <strong>…)
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const k = el.getAttribute('data-i18n-html');
    if (t[k] !== undefined) el.innerHTML = t[k];
  });

  // data-i18n-placeholder → placeholder uniquement (inputs, textareas)
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const k = el.getAttribute('data-i18n-placeholder');
    if (t[k] !== undefined) el.placeholder = t[k];
  });

  // Bouton langue + label mode
  const btn = document.getElementById('lang-btn');
  if (btn) btn.textContent = t.lang_toggle;
  const lbl = document.getElementById('util-mode-label');
  if (lbl) lbl.textContent = isDark ? t.dark_label : t.light_label;

  localStorage.setItem('ea-lang', currentLang);
  document.documentElement.setAttribute('lang', currentLang);

  // Hook pour le contenu généré dynamiquement par chaque page
  if (typeof window.onLangChange === 'function') window.onLangChange();
}

function toggleLang() { currentLang = currentLang === 'fr' ? 'en' : 'fr'; applyLang(); }

function initNav() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 30));
}

function toggleMenu() {
  const p = document.getElementById('mobilePanel');
  const o = document.getElementById('mobileOverlay');
  const b = document.getElementById('hamburger');
  if (!p) return;
  const open = p.classList.toggle('open');
  o?.classList.toggle('open', open);
  b?.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
}

document.addEventListener('DOMContentLoaded', () => {
  injectUtilBar();
  applyDark();
  applyLang();
  initNav();
});
