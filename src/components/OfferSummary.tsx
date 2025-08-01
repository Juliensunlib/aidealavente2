import React from 'react';
import { ArrowLeft, Zap, Calendar, Euro, TrendingUp, CheckCircle, AlertCircle, FileText, Printer, Mail, Users, Building2, Battery } from 'lucide-react';

interface OfferSummaryProps {
  offer: {
    duration: number;
    monthlyPayment: number;
    monthlyPaymentTTC: number;
    minRevenue: number;
    solvability: 'excellent' | 'good' | 'acceptable' | 'difficult';
    residualValues: { year: number; value: number }[];
  };
  power: number;
  clientType: 'particulier' | 'entreprise';
  displayMode: 'HT' | 'TTC';
  virtualBattery: boolean;
  onBack: () => void;
}

const OfferSummary: React.FC<OfferSummaryProps> = ({ offer, power, clientType, displayMode, virtualBattery, onBack }) => {
  const getSolvabilityColor = (solvability: string) => {
    switch (solvability) {
      case 'excellent': return 'text-green-600 bg-green-100 border-green-200';
      case 'good': return 'text-green-500 bg-green-50 border-green-200';
      case 'acceptable': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'difficult': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getSolvabilityIcon = (solvability: string) => {
    switch (solvability) {
      case 'excellent': return <CheckCircle className="w-5 h-5" />;
      case 'good': return <CheckCircle className="w-5 h-5" />;
      case 'acceptable': return <AlertCircle className="w-5 h-5" />;
      case 'difficult': return <AlertCircle className="w-5 h-5" />;
      default: return null;
    }
  };

  const getSolvabilityText = (solvability: string) => {
    switch (solvability) {
      case 'excellent': return 'Excellente solvabilité';
      case 'good': return 'Bonne solvabilité';
      case 'acceptable': return 'Solvabilité acceptable';
      case 'difficult': return 'Solvabilité difficile';
      default: return '';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleMail = () => {
    console.log('handleMail called'); // Debug
    const displayPrice = displayMode === 'HT' ? offer.monthlyPayment : offer.monthlyPaymentTTC;
    
    const subject = 'Offre SunLib - Abonnement ' + clientType + ' ' + power + 'kWc sur ' + offer.duration + ' ans';
    
    const batteryLine = virtualBattery ? '- Batterie virtuelle : Incluse\n' : '';
    
    const bodyText = 'Bonjour,\n\n' +
      'Veuillez trouver ci-dessous le résumé de votre offre SunLib :\n\n' +
      'DÉTAILS DE L\'INSTALLATION\n' +
      '- Puissance installée : ' + power + ' kWc\n' +
      batteryLine + '\n' +
      'CONDITIONS FINANCIÈRES\n' +
      '- Durée du contrat : ' + offer.duration + ' ans\n' +
      '- Mensualité ' + displayMode + ' : ' + displayPrice.toFixed(2) + ' €\n' +
      '- ' + (clientType === 'entreprise' ? 'Solvabilité : Validation sous réserve étude SunLib' : 'Revenus minimum requis : ' + offer.minRevenue.toLocaleString() + ' € / an') + '\n\n' +
      'AVANTAGES PRINCIPAUX\n' +
      '- Pas d\'apport initial\n' +
      '- Pas d\'emprunt\n' +
      '- Économies immédiates\n' +
      '- Tranquillité d\'esprit totale\n' +
      '- Offre de service complète\n' +
      '- Flexibilité\n\n' +
      'ET CONCRÈTEMENT, COMMENT ÇA SE PASSE ?\n' +
      '1. Signature du Devis d\'abonnement\n' +
      '2. Validation du projet par les équipes SunLib\n' +
      '3. Réception et signature du contrat d\'abonnement SunLib\n' +
      '4. Signature du mandat SEPA et prélèvement de ' + (clientType === 'entreprise' ? '3' : '2') + ' mois de caution\n' +
      '5. Accord de la mairie\n' +
      '6. Pose des panneaux et mise en service de l\'installation. Démarrage de l\'abonnement\n\n' +
      'Pour plus d\'informations, n\'hésitez pas à nous contacter.\n\n' +
      'Contact : contact@sunlib.fr\n\n' +
      'Cordialement,\n' +
      'L\'équipe SunLib';

    
    const mailtoUrl = 'mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(bodyText);
    console.log('Opening mailto URL:', mailtoUrl); // Debug
    
    try {
      window.location.href = mailtoUrl;
    } catch (error) {
      console.error('Error opening mail client:', error);
      // Fallback: try with window.open
      window.open(mailtoUrl, '_blank');
    }
  };

  const displayPrice = displayMode === 'HT' ? offer.monthlyPayment : offer.monthlyPaymentTTC;
  const lastResidualValue = offer.residualValues[offer.residualValues.length - 1];

  // Masquer la solvabilité pour tous les clients
  const shouldShowSolvability = false;

  // Avantages selon le type de client (basés sur les PDFs)
  const getClientAdvantages = () => {
    if (clientType === 'particulier') {
      return [
        {
          title: "Pas d'apport initial",
          description: "Zéro investissement initial : votre épargne reste intacte"
        },
        {
          title: "Pas d'emprunt",
          description: "Préserve la capacité d'endettement et évite des démarches longues et complexes de demande de crédit"
        },
        {
          title: "Économies immédiates",
          description: "Économies immédiates dès la première année • Factures d'électricité réduites"
        },
        {
          title: "Tranquillité d'esprit totale",
          description: "En cas de panne, SunLib s'occupe de tout • Garantie de bon fonctionnement incluse"
        },
        {
          title: "Offre de service complète",
          description: "Service client dédié SunLib situé en France • Monitoring 24h/24h • Possibilité d'évolution"
        },
        {
          title: "Flexibilité",
          description: "Choix de la durée d'abonnement de 10 à 25 ans, possibilité d'acquérir l'installation au bout de la 2ème année"
        }
      ];
    } else {
      return [
        {
          title: "Pas d'apport initial",
          description: "Aucun investissement • Préserve la trésorerie et évite l'immobilisation de capital (pas de CAPEX)"
        },
        {
          title: "Pas d'emprunt",
          description: "Préserve la capacité d'endettement • Pas d'engagement hors bilan pour les TPE/PME"
        },
        {
          title: "Économies immédiates",
          description: "Économies dès la première année • Factures d'électricité réduites nettes des frais d'abonnement"
        },
        {
          title: "Tranquillité d'esprit totale",
          description: "Garantie de bon fonctionnement • Monitoring 24h/24 et 7j/7 du système"
        },
        {
          title: "Offre de service complète",
          description: "APP SunLib pour le suivi • Service client dédié en France"
        },
        {
          title: "Avantages professionnels",
          description: "Possibilité d'acquérir l'installation au bout de la 5ème année • Protection contre les fluctuations du prix de l'électricité"
        }
      ];
    }
  };

  // Processus commun (basé sur le PDF "A mettre partout")
  const getCommonProcess = () => {
    return [
      {
        step: "1",
        title: "Signature du Devis d'abonnement",
        description: "Vous signez le devis d'abonnement personnalisé selon vos besoins"
      },
      {
        step: "2",
        title: "Validation du projet par les équipes SunLib",
        description: "Les équipes SunLib procédent aux verifications nécessaires et valide votre projet"
      },
      {
        step: "3",
        title: "Réception et signature du contrat d'abonnement SunLib",
        description: "Vous recevez et signez le contrat d'abonnement SunLib"
      },
      {
        step: "4",
        title: "Signature du mandat SEPA et prélèvement de la caution",
        description: `Vous signez le mandat SEPA et vous êtes prélevé de ${clientType === 'entreprise' ? '3' : '2'} mois de caution`
      },
      {
        step: "5",
        title: "Accord de la mairie",
        description: "Obtention de l'approbation de la mairie pour les travaux"
      },
      {
        step: "6",
        title: "Pose des panneaux et mise en service de l'installation",
        description: "Installation des panneaux solaires et mise en service. Démarrage de l'abonnement"
      }
    ];
  };

  return (
    <>
      {/* Styles CSS pour l'impression */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body {
              margin: 0;
              padding: 0;
              font-size: 10px;
            }
            
            .print-single-page {
              page-break-inside: avoid;
            }
            
            .print-compact {
              margin: 0 !important;
              padding: 5px !important;
            }
            
            .print-compact-header {
              padding: 8px !important;
            }
            
            .print-compact-section {
              margin-bottom: 12px !important;
              padding: 8px !important;
            }
            
            .print-small-text {
              font-size: 9px !important;
            }
            
            .print-tiny-text {
              font-size: 8px !important;
            }
            
            .print-grid {
              display: flex !important;
              flex-direction: row !important;
              gap: 12px !important;
            }
            
            .print-grid > div {
              flex: 1 !important;
            }
            
            .print-advantages-grid {
              display: grid !important;
              grid-template-columns: 1fr 1fr !important;
              gap: 6px !important;
            }
            
            .print-advantages-item {
              font-size: 8px !important;
              margin-bottom: 4px !important;
            }
            
            .print-process-steps {
              display: grid !important;
              grid-template-columns: 1fr 1fr !important;
              gap: 6px !important;
            }
            
            .print-process-item {
              font-size: 8px !important;
              margin-bottom: 4px !important;
            }
            
            .print-residual-section {
              margin-top: 4px !important;
              padding: 3px !important;
              border: 1px solid #ddd !important;
              border-radius: 4px !important;
            }
            
            .print-residual-table {
              font-size: 5px !important;
              line-height: 1.1 !important;
            }
            
            .print-residual-table th {
              padding: 1px 1px !important;
              font-size: 5px !important;
            }
            
            .print-residual-table td {
              padding: 1px 1px !important;
              font-size: 5px !important;
            }
            
            .print-residual-grid {
              display: grid !important;
              grid-template-columns: 1fr 1fr 1fr !important;
              gap: 2px !important;
            }
            
            .print-hide {
              display: none !important;
            }
            
            .print-header-compact h1 {
              font-size: 20px !important;
              margin-bottom: 4px !important;
            }
            
            .print-header-compact h2 {
              font-size: 14px !important;
              margin-bottom: 4px !important;
            }
            
            .print-section-title {
              font-size: 12px !important;
              margin-bottom: 6px !important;
            }
            
            .print-step-circle {
              width: 16px !important;
              height: 16px !important;
              font-size: 9px !important;
              margin-right: 8px !important;
            }
            
            .print-advantage-icon {
              width: 12px !important;
              height: 12px !important;
              margin-right: 6px !important;
            }
            
            .print-warning-box {
              margin-top: 8px !important;
              padding: 6px !important;
              font-size: 8px !important;
            }
            
            .print-residual-title {
              font-size: 9px !important;
              margin-bottom: 1px !important;
              text-align: center !important;
            }
            
            .print-main-content {
              padding: 10px !important;
            }
            
            .print-main-sections {
              margin-bottom: 15px !important;
            }
            
            .print-advantages-section {
              margin-bottom: 12px !important;
              padding: 10px !important;
            }
            
            .print-process-section {
              margin-bottom: 8px !important;
              padding: 8px !important;
            }
            
            .print-advantages-bordered {
              border: 2px solid #16a34a !important;
              border-radius: 8px !important;
            }
          }
        `
      }} />
      
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4 print:bg-white print:p-0">
        <div className="max-w-4xl mx-auto print:max-w-none">
          {/* Header avec bouton retour */}
          <div className="flex items-center justify-between mb-8 print-hide">
            <button
              onClick={onBack}
              className="flex items-center text-green-700 hover:text-green-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour aux résultats
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={handleMail}
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Mail className="w-4 h-4 mr-2" />
                Envoyer par mail
              </button>
              
              <button
                onClick={handlePrint}
                className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimer
              </button>
            </div>
          </div>

          {/* PAGE UNIQUE - Tout le contenu */}
          <div className="print-single-page">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 print:rounded-none print:shadow-none print:mb-0">
              {/* En-tête de l'offre */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-8 print-compact-header print:bg-green-600 print-header-compact">
                <div className="flex items-center justify-center mb-4 print:mb-1">
                  <Zap className="w-12 h-12 mr-3 print:w-6 print:h-6 print:mr-2" />
                  <h1 className="text-4xl font-bold">SunLib</h1>
                </div>
                <h2 className="text-2xl font-semibold text-center">Résumé de votre offre solaire</h2>
                <div className="flex items-center justify-center mt-2 print:mt-1">
                  {clientType === 'particulier' ? (
                    <Users className="w-5 h-5 mr-2 print:w-3 print:h-3" />
                  ) : (
                    <Building2 className="w-5 h-5 mr-2 print:w-3 print:h-3" />
                  )}
                  <p className="text-green-100 print:text-xs">
                    Abonnement {clientType} sur {offer.duration} ans
                  </p>
                </div>
              </div>

              {/* Contenu principal */}
              <div className="p-8 print-main-content">
                <div className="grid md:grid-cols-2 gap-8 mb-6 print-grid print:mb-3 print-main-sections">
                  {/* Détails de l'installation */}
                  <div className="space-y-6 print:space-y-2">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center print-section-title">
                      <Zap className="w-5 h-5 text-green-600 mr-2 print:w-3 print:h-3" />
                      Détails de l'installation
                    </h3>
                    
                    <div className="bg-green-50 p-4 rounded-lg print:p-2">
                      <div className="flex justify-between items-center mb-2 print:mb-1">
                        <span className="text-gray-700 print:text-xs">Puissance installée</span>
                        <span className="font-semibold text-green-800 print:text-xs">{power} kWc</span>
                      </div>
                      <div className="flex justify-between items-center mb-2 print:mb-1">
                        <span className="text-gray-700 print:text-xs">Type de client</span>
                        <span className="font-semibold text-green-800 capitalize print:text-xs">{clientType}</span>
                      </div>
                      {virtualBattery && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 print:text-xs flex items-center">
                            <Battery className="w-4 h-4 mr-1 print:w-2 print:h-2" />
                            Batterie virtuelle
                          </span>
                          <span className="font-semibold text-green-800 print:text-xs">
                            Incluse
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Conditions financières */}
                  <div className="space-y-6 print:space-y-2">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center print-section-title">
                      <Euro className="w-5 h-5 text-green-600 mr-2 print:w-3 print:h-3" />
                      Conditions financières
                    </h3>
                    
                    <div className="bg-green-50 p-4 rounded-lg print:p-2">
                      <div className="flex justify-between items-center mb-2 print:mb-1">
                        <span className="text-gray-700 print:text-xs">Durée du contrat</span>
                        <span className="font-semibold text-green-800 print:text-xs">{offer.duration} ans</span>
                      </div>
                      <div className="flex justify-between items-center mb-2 print:mb-1">
                        <span className="text-gray-700 print:text-xs">Mensualité {displayMode}</span>
                        <span className="font-semibold text-green-800 print:text-xs">{displayPrice.toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 print:text-xs">
                          {clientType === 'entreprise' ? 'Solvabilité :' : 'Revenus minimum requis'}
                        </span>
                        <span className="font-semibold text-green-800 print:text-xs">
                          {clientType === 'entreprise' 
                            ? 'Étude SunLib'
                            : `${offer.minRevenue.toLocaleString()} €/an`
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Avantages de l'offre avec cadre */}
                <div className="mt-6 bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border-2 border-green-600 print-advantages-section print-advantages-bordered">
                  <h3 className="text-lg font-semibold text-green-800 mb-3 text-center print-section-title print:mb-2">
                    Avantages de votre abonnement SunLib
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-3 print-advantages-grid">
                    {getClientAdvantages().map((advantage, index) => (
                      <div key={index} className="flex items-start print-advantages-item">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0 print-advantage-icon" />
                        <div>
                          <p className="font-medium text-green-800 text-sm print:text-xs print:font-semibold">{advantage.title}</p>
                          <p className="text-xs text-green-700 print:text-xs">{advantage.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Processus de mise en place */}
                <div className="mt-6 bg-white border-2 border-green-200 p-4 rounded-lg print-process-section">
                  <h3 className="text-lg font-semibold text-green-800 mb-4 text-center flex items-center justify-center print-section-title print:mb-2">
                    <Calendar className="w-4 h-4 mr-2 print:w-3 print:h-3" />
                    Comment ça se passe ?
                  </h3>
                  
                  <div className="space-y-3 print-process-steps print:space-y-1">
                    {getCommonProcess().map((process, index) => (
                      <div key={index} className="flex items-start print-process-item">
                        <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 print-step-circle">
                          {process.step}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-green-800 text-sm print:text-xs print:font-semibold">{process.title}</h4>
                          <p className="text-xs text-green-700 print:text-xs">{process.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg print-warning-box">
                    <p className="text-xs text-yellow-800 text-center print:text-xs">
                      <strong>Important :</strong> En cas de refus de la mairie, le contrat est annulé et le dépôt de garantie restitué
                    </p>
                  </div>
                </div>

                {/* Valeurs résiduelles compactes */}
                <div className="mt-6 bg-gray-50 p-4 rounded-lg print-residual-section">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center flex items-center justify-center print-residual-title">
                    <TrendingUp className="w-4 h-4 mr-2 print:w-3 print:h-3" />
                    Valeurs résiduelles ({displayMode})
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-2 print-residual-grid">
                    {/* Première colonne */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs print-residual-table">
                        <thead>
                          <tr>
                            <th className="bg-green-600 text-white px-2 py-1 text-left text-xs">Année</th>
                            <th className="bg-green-600 text-white px-2 py-1 text-right text-xs">Valeur</th>
                          </tr>
                        </thead>
                        <tbody>
                          {offer.residualValues.slice(0, Math.ceil(offer.residualValues.length / 3)).map((residual, index) => (
                            <tr key={residual.year} className={index % 2 === 0 ? 'bg-white' : 'bg-green-50'}>
                              <td className="px-2 py-1 border-b border-green-200 text-gray-700 text-xs">
                                {residual.year}
                              </td>
                              <td className="px-2 py-1 border-b border-green-200 text-right font-semibold text-green-800 text-xs">
                                {residual.value.toLocaleString()}€
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Deuxième colonne */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs print-residual-table">
                        <thead>
                          <tr>
                            <th className="bg-green-600 text-white px-2 py-1 text-left text-xs">Année</th>
                            <th className="bg-green-600 text-white px-2 py-1 text-right text-xs">Valeur</th>
                          </tr>
                        </thead>
                        <tbody>
                          {offer.residualValues.slice(Math.ceil(offer.residualValues.length / 3), Math.ceil(offer.residualValues.length * 2 / 3)).map((residual, index) => (
                            <tr key={residual.year} className={index % 2 === 0 ? 'bg-white' : 'bg-green-50'}>
                              <td className="px-2 py-1 border-b border-green-200 text-gray-700 text-xs">
                                {residual.year}
                              </td>
                              <td className="px-2 py-1 border-b border-green-200 text-right font-semibold text-green-800 text-xs">
                                {residual.value.toLocaleString()}€
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Troisième colonne */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs print-residual-table">
                        <thead>
                          <tr>
                            <th className="bg-green-600 text-white px-2 py-1 text-left text-xs">Année</th>
                            <th className="bg-green-600 text-white px-2 py-1 text-right text-xs">Valeur</th>
                          </tr>
                        </thead>
                        <tbody>
                          {offer.residualValues.slice(Math.ceil(offer.residualValues.length * 2 / 3)).map((residual, index) => (
                            <tr key={residual.year} className={index % 2 === 0 ? 'bg-white' : 'bg-green-50'}>
                              <td className="px-2 py-1 border-b border-green-200 text-gray-700 text-xs">
                                {residual.year}
                              </td>
                              <td className="px-2 py-1 border-b border-green-200 text-right font-semibold text-green-800 text-xs">
                                {residual.value.toLocaleString()}€
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-600 text-sm print-hide">
            <p>Document généré par l'outil d'aide à la vente SunLib</p>
            <p className="mt-1">Pour plus d'informations, contactez votre conseiller SunLib</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default OfferSummary;
