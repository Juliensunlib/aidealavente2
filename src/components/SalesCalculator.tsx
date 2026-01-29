import React, { useState } from 'react';
import { Calculator, Zap, CheckCircle, AlertCircle, TrendingUp, ArrowLeft, FileText, Users, Building2, ChevronUp, ChevronDown, Battery } from 'lucide-react';
import OfferSummary from './OfferSummary';

interface CalculationResult {
  duration: number;
  monthlyPayment: number;
  monthlyPaymentTTC: number;
  batteryMonthlyPayment?: number;
  batteryMonthlyPaymentTTC?: number;
  totalMonthlyPayment?: number;
  totalMonthlyPaymentTTC?: number;
  minRevenue: number;
  solvability: 'excellent' | 'good' | 'acceptable' | 'difficult';
  residualValues: { year: number; value: number; valueTTC: number }[];
  batteryResidualValues?: { year: number; value: number; valueTTC: number }[];
  totalResidualValues?: { year: number; value: number; valueTTC: number }[];
  batteryDuration?: number;
}

const SalesCalculator: React.FC = () => {
  const [power, setPower] = useState<string>('');
  const [installationPrice, setInstallationPrice] = useState<string>('');
  // const [initialPayment, setInitialPayment] = useState<string>(''); // DÉSACTIVÉ - Pour réactiver plus tard
  const [clientType, setClientType] = useState<'particulier' | 'entreprise'>('particulier');
  const [displayMode, setDisplayMode] = useState<'HT' | 'TTC'>('TTC');
  const [virtualBattery, setVirtualBattery] = useState<boolean>(false);
  const [physicalBattery, setPhysicalBattery] = useState<boolean>(false);
  const [batteryPower, setBatteryPower] = useState<string>('');
  const [batteryPrice, setBatteryPrice] = useState<string>('');
  const [batteryDuration, setBatteryDuration] = useState<10 | 15>(10);
  const [results, setResults] = useState<CalculationResult[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showOfferSummary, setShowOfferSummary] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string>('');
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);

  // Données de prix maximum par puissance (jusqu'à 36 kWc)
  const maxPricesHT = [
    5200, 5500, 6290, 6750, 7542, 8333, 9250, 10083, 10833, 11417, 12000, 12500, 13083, 13667, 14167,
    14635, 15170, 15700, 16230, 16765, 17300, 17833, 18380, 18900, 19450, 20000, 20700, 21390, 22080,
    22770, 23460, 24150, 24840, 25530, 26220, 26910, 27600, 28290, 28980, 29670, 30360, 31050, 31740,
    32430, 33120, 33810, 34500, 35190, 35880, 36570, 37260, 37950, 38640, 39330, 40020, 40710, 41400,
    42090, 42780, 43470, 44160, 44850, 45540, 46230, 46920, 47610, 48300, 48990, 49680
  ];

  // Pourcentages pour les valeurs résiduelles
  const residualPercentages = {
    25: [106.0, 105.0, 104.0, 103.0, 102.0, 101.0, 99.0, 96.0, 95.0, 94.0, 93.0, 92.0, 91.0, 90.0, 87.0, 80.0, 71.0, 64.0, 55.0, 46.0, 36.0, 24.0, 12.8],
    20: [106.0, 105.0, 104.0, 103.0, 102.0, 100.0, 96.0, 93.0, 90.0, 86.0, 80.0, 75.0, 66.0, 59.0, 47.4, 37.8, 24.0, 12.9],
    15: [97.5, 95.0, 93.0, 91.0, 89.0, 86.0, 81.0, 75.0, 69.0, 61.0, 51.0, 37.0, 13.8],
    10: [94.0, 91.0, 87.0, 81.0, 71.0, 60.0, 42.0, 15.5]
  };

  // Pourcentages pour les valeurs résiduelles de la batterie
  const batteryResidualPercentages = {
    15: [94.5, 93.1, 91.3, 89.1, 86.3, 82.8, 78.4, 72.8, 65.8, 57.1, 46.0, 32.2, 14.8],
    10: [94.0, 91.2, 87.2, 81.4, 64.7, 60.4, 42.2, 15.8]
  };

  // Taux variables uniquement
  const getVariableRates = (duration: number, powerValue: number) => {
    const variableRates = {
      25: [8.50, 8.50, 8.50, 9.10, 9.20, 9.30, 9.34, 9.39, 9.50, 9.60, 9.71, 9.80, 9.85, 9.89, 10.00, 10.10, 10.22, 10.30, 10.35, 10.40, 10.48, 10.60, 10.70, 10.80, 10.90, 11.00],
      20: [8.75, 8.75, 8.75, 9.35, 9.45, 9.55, 9.59, 9.64, 9.75, 9.85, 9.96, 10.05, 10.10, 10.14, 10.25, 10.35, 10.47, 10.55, 10.60, 10.65, 10.73, 10.85, 10.95, 11.05, 11.15, 11.25],
      15: [9.10, 9.10, 9.10, 9.70, 9.80, 9.90, 9.94, 9.99, 10.10, 10.20, 10.31, 10.40, 10.45, 10.49, 10.60, 10.70, 10.82, 10.90, 10.95, 11.00, 11.08, 11.20, 11.30, 11.40, 11.50, 11.60],
      10: [10.00, 10.00, 10.00, 10.60, 10.70, 10.80, 10.84, 10.89, 11.00, 11.10, 11.21, 11.30, 11.35, 11.39, 11.50, 11.60, 11.72, 11.80, 11.85, 11.90, 11.98, 12.10, 12.20, 12.30, 12.40, 12.50],
    };

    let index = Math.floor((powerValue - 2) / 0.5);
    
    // Pour les puissances > 36 kWc, utiliser les paramètres du 36 kWc (dernier index)
    if (powerValue > 36) {
      index = 25; // Index correspondant à 36 kWc
    } else {
      index = Math.max(0, Math.min(index, 25));
    }
    
    const rateArray = variableRates[duration as keyof typeof variableRates];
    const rate = index < rateArray.length ? rateArray[index] : rateArray[rateArray.length - 1];
    
    return rate / 100;
  };

  const calculateMonthlyPayment = (capital: number, rate: number, months: number) => {
    const monthlyRate = rate / 12;
    const payment = capital * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months));
    return Math.round(payment * 100) / 100;
  };

  const calculateMinRevenue = (monthlyPayment: number, hasPhysicalBattery: boolean): number => {
    // Sans batterie physique : 4% des revenus annuels maximum
    // Avec batterie physique : 7% des revenus annuels maximum
    const maxPercentage = hasPhysicalBattery ? 0.07 : 0.04;
    const annualPayment = monthlyPayment * 12;
    const minAnnualRevenue = annualPayment / maxPercentage;
    return Math.round(minAnnualRevenue);
  };

  const getSolvability = (monthlyPayment: number): 'excellent' | 'good' | 'acceptable' | 'difficult' => {
    if (monthlyPayment <= 150) return 'excellent';
    if (monthlyPayment <= 250) return 'good';
    if (monthlyPayment <= 400) return 'acceptable';
    return 'difficult';
  };

  const calculateResidualValues = (initialPrice: number, duration: number) => {
    const percentages = residualPercentages[duration as keyof typeof residualPercentages];
    const startYear = clientType === 'entreprise' ? 5 : 2;
    const skipYears = clientType === 'entreprise' ? 3 : 0;

    // Pour les particuliers, calculer les valeurs résiduelles sur le prix TTC
    const basePrice = clientType === 'particulier' ? initialPrice * 1.20 : initialPrice;

    return percentages
      .slice(skipYears)
      .map((percentage, index) => {
        const year = index + startYear;
        let valueHT: number;
        let valueTTC: number;

        if (clientType === 'particulier') {
          // Pour les particuliers: appliquer le pourcentage sur le prix TTC
          valueTTC = Math.round((basePrice * percentage / 100) * 100) / 100;
          valueHT = Math.round((valueTTC / 1.20) * 100) / 100;
        } else {
          // Pour les entreprises: appliquer le pourcentage sur le prix HT
          valueHT = Math.round((initialPrice * percentage / 100) * 100) / 100;
          valueTTC = Math.round((valueHT * 1.20) * 100) / 100;
        }

        return {
          year,
          value: valueHT,
          valueTTC: valueTTC
        };
      })
      .filter(residual => residual.year <= duration);
  };

  const calculateBatteryMonthlyPayment = (batteryPriceValue: number, batteryDurationValue: number) => {
    // Taux fixes pour la batterie
    const batteryRates = {
      15: 0.106,
      10: 0.115
    };

    const annualRate = batteryRates[batteryDurationValue as keyof typeof batteryRates];
    const monthlyRate = annualRate / 12;
    const months = batteryDurationValue * 12;

    const payment = batteryPriceValue * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months));
    return Math.round(payment * 100) / 100;
  };

  const calculateBatteryResidualValues = (batteryPriceValue: number, batteryDurationValue: number) => {
    const percentages = batteryResidualPercentages[batteryDurationValue as keyof typeof batteryResidualPercentages];
    const startYear = clientType === 'entreprise' ? 5 : 2;
    const skipYears = clientType === 'entreprise' ? 3 : 0;

    // Pour les particuliers, calculer les valeurs résiduelles sur le prix TTC
    const basePrice = clientType === 'particulier' ? batteryPriceValue * 1.20 : batteryPriceValue;

    return percentages
      .slice(skipYears)
      .map((percentage, index) => {
        const year = index + startYear;
        let valueHT: number;
        let valueTTC: number;

        if (clientType === 'particulier') {
          // Pour les particuliers: appliquer le pourcentage sur le prix TTC
          valueTTC = Math.round((basePrice * percentage / 100) * 100) / 100;
          valueHT = Math.round((valueTTC / 1.20) * 100) / 100;
        } else {
          // Pour les entreprises: appliquer le pourcentage sur le prix HT
          valueHT = Math.round((batteryPriceValue * percentage / 100) * 100) / 100;
          valueTTC = Math.round((valueHT * 1.20) * 100) / 100;
        }

        return {
          year,
          value: valueHT,
          valueTTC: valueTTC
        };
      })
      .filter(residual => residual.year <= batteryDurationValue);
  };

  const calculateTotalResidualValues = (
    panelResiduals: { year: number; value: number; valueTTC: number }[],
    batteryResiduals: { year: number; value: number; valueTTC: number }[]
  ) => {
    const allYears = new Set([
      ...panelResiduals.map(r => r.year),
      ...batteryResiduals.map(r => r.year)
    ]);

    return Array.from(allYears).sort((a, b) => a - b).map(year => {
      const panelValue = panelResiduals.find(r => r.year === year);
      const batteryValue = batteryResiduals.find(r => r.year === year);

      const valueHT = (panelValue?.value || 0) + (batteryValue?.value || 0);
      const valueTTC = (panelValue?.valueTTC || 0) + (batteryValue?.valueTTC || 0);

      return {
        year,
        value: Math.round(valueHT * 100) / 100,
        valueTTC: Math.round(valueTTC * 100) / 100
      };
    });
  };

  const handleCalculate = () => {
    setError('');
    const powerValue = parseFloat(power);
    const priceValue = parseFloat(installationPrice);
    const hasPanels = !isNaN(powerValue) && !isNaN(priceValue) && powerValue >= 2;

    // Validation batterie physique
    const batteryPowerValue = parseFloat(batteryPower);
    const batteryPriceValue = parseFloat(batteryPrice);
    const hasBattery = physicalBattery && !isNaN(batteryPowerValue) && !isNaN(batteryPriceValue);

    // Si batterie virtuelle est cochée, les panneaux sont obligatoires
    if (virtualBattery && !hasPanels) {
      setError('Veuillez renseigner les panneaux solaires (puissance et prix d\'installation).');
      return;
    }

    // Au moins un des deux doit être renseigné
    if (!hasPanels && !hasBattery) {
      setError('Veuillez renseigner au moins les panneaux ou la batterie physique.');
      return;
    }

    // Validation des panneaux si renseignés
    if (hasPanels) {
      if (powerValue < 2) {
        setError('La puissance doit être supérieure ou égale à 2 kWc.');
        return;
      }

      // Vérification du plafond de prix SEULEMENT pour les puissances ≤ 36 kWc
      if (powerValue <= 36) {
        const index = Math.round((powerValue - 2) / 0.5);
        const maxPrice = maxPricesHT[Math.min(index, maxPricesHT.length - 1)];

        if (priceValue > maxPrice) {
          setError(`Prix HT dépasse le plafond autorisé (${maxPrice.toLocaleString()} €). Hors tarif Sunlib.`);
          return;
        }
      }
    }

    // Validation batterie physique si renseignée
    if (physicalBattery) {
      if (!hasBattery) {
        setError('Veuillez remplir tous les champs de la batterie physique.');
        return;
      }

      // Vérification du tarif batterie (prix par kWh ne doit pas dépasser 500 €)
      const pricePerKwh = batteryPriceValue / batteryPowerValue;
      if (pricePerKwh > 500) {
        setError(`Prix batterie hors tarif SunLib (${pricePerKwh.toFixed(2)} €/kWh > 500 €/kWh).`);
        return;
      }
    }

    // DÉSACTIVÉ - Calcul du capital à financer avec versement initial
    // const initialPaymentValue = parseFloat(initialPayment) || 0;
    // Si entreprise en HT : versement initial est déjà en HT
    // Si particulier en TTC : versement initial est en TTC, on le convertit en HT
    // const initialPaymentHT = initialPaymentValue > 0
    //   ? (clientType === 'entreprise' && displayMode === 'HT'
    //       ? initialPaymentValue
    //       : initialPaymentValue / 1.20)
    //   : 0;
    // const capitalToFinance = hasPanels && initialPaymentHT > 0 ? priceValue - initialPaymentHT : priceValue;

    // Si on n'a que la batterie, on propose seulement 10 et 15 ans
    const durations = hasPanels ? [10, 15, 20, 25] : [10, 15];
    const calculatedResults: CalculationResult[] = durations.map(duration => {
      let monthlyPaymentHT = 0;
      let monthlyPaymentTTC = 0;
      let residualValues: { year: number; value: number; valueTTC: number }[] = [];

      // Calcul panneaux si présents
      if (hasPanels) {
        const rate = getVariableRates(duration, powerValue);
        monthlyPaymentHT = calculateMonthlyPayment(priceValue, rate, duration * 12);
        monthlyPaymentTTC = monthlyPaymentHT * 1.20;
        residualValues = calculateResidualValues(priceValue, duration);
      }

      let batteryMonthlyPaymentHT = 0;
      let batteryMonthlyPaymentTTC = 0;
      let batteryResiduals: { year: number; value: number; valueTTC: number }[] = [];
      let totalResiduals: { year: number; value: number; valueTTC: number }[] = [];

      // Calcul batterie physique si présente
      if (hasBattery) {
        batteryMonthlyPaymentHT = calculateBatteryMonthlyPayment(batteryPriceValue, batteryDuration);
        batteryMonthlyPaymentTTC = batteryMonthlyPaymentHT * 1.20;
        batteryResiduals = calculateBatteryResidualValues(batteryPriceValue, batteryDuration);
      }

      const totalMonthlyPaymentHT = monthlyPaymentHT + batteryMonthlyPaymentHT;
      const totalMonthlyPaymentTTC = monthlyPaymentTTC + batteryMonthlyPaymentTTC;

      const minRevenue = calculateMinRevenue(totalMonthlyPaymentTTC, hasBattery);
      const solvability = getSolvability(totalMonthlyPaymentTTC);

      // Calcul valeurs résiduelles totales
      if (hasPanels && hasBattery && batteryResiduals.length > 0) {
        totalResiduals = calculateTotalResidualValues(residualValues, batteryResiduals);
      }

      return {
        duration,
        monthlyPayment: monthlyPaymentHT,
        monthlyPaymentTTC,
        batteryMonthlyPayment: hasBattery ? batteryMonthlyPaymentHT : undefined,
        batteryMonthlyPaymentTTC: hasBattery ? batteryMonthlyPaymentTTC : undefined,
        totalMonthlyPayment: (hasPanels && hasBattery) || (!hasPanels && hasBattery) ? totalMonthlyPaymentHT : undefined,
        totalMonthlyPaymentTTC: (hasPanels && hasBattery) || (!hasPanels && hasBattery) ? totalMonthlyPaymentTTC : undefined,
        minRevenue,
        solvability,
        residualValues: hasPanels ? residualValues : [],
        batteryResidualValues: hasBattery ? batteryResiduals : undefined,
        totalResidualValues: (hasPanels && hasBattery) ? totalResiduals : undefined,
        batteryDuration: hasBattery ? batteryDuration : undefined
      };
    });

    setResults(calculatedResults);
    setShowResults(true);
    setSelectedDuration(null);
    setIsFormCollapsed(true);
  };

  const handleOfferSelection = (result: CalculationResult) => {
    setSelectedOffer(result);
    setShowOfferSummary(true);
  };

  const toggleFormCollapse = () => {
    setIsFormCollapsed(!isFormCollapsed);
  };

  if (showOfferSummary && selectedOffer) {
    return (
      <OfferSummary
        offer={selectedOffer}
        power={parseFloat(power)}
        installationPrice={parseFloat(installationPrice)}
        initialPayment={0} // DÉSACTIVÉ - Versement initial
        clientType={clientType}
        displayMode={displayMode}
        virtualBattery={virtualBattery}
        physicalBattery={physicalBattery}
        batteryPower={physicalBattery ? parseFloat(batteryPower) : undefined}
        onBack={() => setShowOfferSummary(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Zap className="w-12 h-12 text-green-600 mr-3" />
            <h1 className="text-4xl font-bold text-green-800">SunLib</h1>
          </div>
          <p className="text-xl text-green-700">Outil d'aide à la vente</p>
          <p className="text-green-600 mt-2">Calculez vos abonnements solaires personnalisés</p>
        </div>

        {/* Formulaire de saisie */}
        <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden">
          {/* En-tête du formulaire avec bouton de collapse */}
          <div 
            className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={toggleFormCollapse}
          >
            <div className="flex items-center">
              <Calculator className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-800">
                Paramètres du projet
              </h2>
            </div>
            {showResults && (
              <button className="text-green-600 hover:text-green-800 transition-colors">
                {isFormCollapsed ? (
                  <ChevronDown className="w-6 h-6" />
                ) : (
                  <ChevronUp className="w-6 h-6" />
                )}
              </button>
            )}
          </div>

          {/* Contenu du formulaire */}
          <div className={`transition-all duration-300 ease-in-out ${isFormCollapsed ? 'max-h-0 opacity-0' : 'max-h-none opacity-100'}`}>
            <div className="px-8 pb-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Puissance (kWc)
                  </label>
                  <input
                    type="number"
                    value={power}
                    onChange={(e) => setPower(e.target.value)}
                    min="2"
                    step="0.5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Ex: 6.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix installation HT (€)
                  </label>
                  <input
                    type="number"
                    value={installationPrice}
                    onChange={(e) => setInstallationPrice(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Ex: 15000"
                  />
                </div>

                {/* DÉSACTIVÉ - Champ versement initial
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Versement initial {displayMode} (€)
                  </label>
                  <input
                    type="number"
                    value={initialPayment}
                    onChange={(e) => setInitialPayment(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Optionnel"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optionnel - Réduit les mensualités</p>
                </div>
                */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de client
                  </label>
                  <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setClientType('particulier')}
                      className={`flex-1 px-3 py-3 text-sm font-medium transition-colors flex items-center justify-center ${
                        clientType === 'particulier'
                          ? 'bg-green-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Users className="w-4 h-4 mr-1" />
                      Particulier
                    </button>
                    <button
                      type="button"
                      onClick={() => setClientType('entreprise')}
                      className={`flex-1 px-3 py-3 text-sm font-medium transition-colors flex items-center justify-center ${
                        clientType === 'entreprise'
                          ? 'bg-green-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Building2 className="w-4 h-4 mr-1" />
                      Entreprise
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Affichage des prix
                  </label>
                  <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setDisplayMode('HT')}
                      className={`flex-1 px-3 py-3 text-sm font-medium transition-colors ${
                        displayMode === 'HT'
                          ? 'bg-green-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      HT
                    </button>
                    <button
                      type="button"
                      onClick={() => setDisplayMode('TTC')}
                      className={`flex-1 px-3 py-3 text-sm font-medium transition-colors ${
                        displayMode === 'TTC'
                          ? 'bg-green-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      TTC
                    </button>
                  </div>
                </div>
              </div>

              {/* Message pour puissance > 36 kWc */}
              {parseFloat(power) > 36 && (
                <div className="mt-6 max-w-6xl mx-auto">
                  <div className="p-4 bg-blue-100 border border-blue-400 text-blue-800 rounded-lg text-center">
                    <p className="font-medium">Le prix de l'installation sera validé par SunLib</p>
                  </div>
                </div>
              )}

              {/* DÉSACTIVÉ - Affichage du capital financé si versement initial
              {parseFloat(initialPayment) > 0 && parseFloat(installationPrice) > 0 && (
                <div className="mt-6 max-w-6xl mx-auto">
                  <div className="p-4 bg-green-100 border-2 border-green-400 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-800 mb-3 text-center">Calcul avec versement initial</h3>
                    <div className="space-y-2 text-sm text-green-800">
                      <div className="flex justify-between items-center">
                        <span>Prix installation HT</span>
                        <span className="font-semibold">{parseFloat(installationPrice).toLocaleString()} €</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Versement initial {displayMode}</span>
                        <span className="font-semibold">{parseFloat(initialPayment).toLocaleString()} €</span>
                      </div>
                      {clientType === 'particulier' && displayMode === 'TTC' && (
                        <div className="flex justify-between items-center">
                          <span>Versement initial HT (÷ 1.20)</span>
                          <span className="font-semibold">{(parseFloat(initialPayment) / 1.20).toFixed(2)} €</span>
                        </div>
                      )}
                      <div className="border-t-2 border-green-600 pt-2 mt-2 flex justify-between items-center">
                        <span className="font-bold">Capital à financer HT</span>
                        <span className="font-bold text-lg text-green-700">
                          {(() => {
                            const initialPmt = parseFloat(initialPayment);
                            const installPrice = parseFloat(installationPrice);
                            const initialPmtHT = clientType === 'entreprise' && displayMode === 'HT'
                              ? initialPmt
                              : initialPmt / 1.20;
                            return (installPrice - initialPmtHT).toFixed(2);
                          })()} €
                        </span>
                      </div>
                      <p className="text-xs text-green-700 text-center mt-2 italic">
                        Les mensualités seront calculées sur le capital financé
                      </p>
                    </div>
                  </div>
                </div>
              )}
              */}

              {/* Options Batteries */}
              <div className="mt-6 max-w-4xl mx-auto">
                <div className="flex flex-wrap items-center justify-center gap-4">
                  {/* Batterie virtuelle */}
                  <label className="flex items-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg p-4 border-2 border-gray-200 hover:border-green-300">
                    <input
                      type="checkbox"
                      checked={virtualBattery}
                      onChange={(e) => {
                        setVirtualBattery(e.target.checked);
                        if (e.target.checked) {
                          setPhysicalBattery(false);
                        }
                      }}
                      className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                    />
                    <Battery className={`w-6 h-6 ml-3 mr-2 ${virtualBattery ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${virtualBattery ? 'text-green-800' : 'text-gray-600'}`}>
                      Batterie virtuelle incluse
                    </span>
                  </label>

                  {/* Batterie physique */}
                  <label className="flex items-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg p-4 border-2 border-gray-200 hover:border-green-300">
                    <input
                      type="checkbox"
                      checked={physicalBattery}
                      onChange={(e) => {
                        setPhysicalBattery(e.target.checked);
                        if (e.target.checked) {
                          setVirtualBattery(false);
                        }
                      }}
                      className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                    />
                    <Battery className={`w-6 h-6 ml-3 mr-2 ${physicalBattery ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${physicalBattery ? 'text-green-800' : 'text-gray-600'}`}>
                      Batterie physique
                    </span>
                  </label>
                </div>

                {/* Champs conditionnels batterie physique */}
                {physicalBattery && (
                  <div className="mt-4 p-6 bg-green-50 border-2 border-green-300 rounded-lg">
                    <h4 className="text-lg font-semibold text-green-800 mb-4">Configuration batterie physique</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Puissance (kWh)
                        </label>
                        <input
                          type="number"
                          value={batteryPower}
                          onChange={(e) => setBatteryPower(e.target.value)}
                          min="0"
                          step="0.1"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          placeholder="Ex: 10"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prix HT (€)
                        </label>
                        <input
                          type="number"
                          value={batteryPrice}
                          onChange={(e) => setBatteryPrice(e.target.value)}
                          min="0"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          placeholder="Ex: 8000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Durée d'abonnement
                        </label>
                        <select
                          value={batteryDuration}
                          onChange={(e) => setBatteryDuration(parseInt(e.target.value) as 10 | 15)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        >
                          <option value={10}>10 ans</option>
                          <option value={15}>15 ans</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg max-w-4xl mx-auto">
                  {error}
                </div>
              )}

              <div className="mt-8 max-w-4xl mx-auto">
                <button
                  onClick={handleCalculate}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 shadow-lg"
                >
                  Calculer les abonnements
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Résultats */}
        {showResults && (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-green-800 text-center">Résultats des calculs</h3>
            
            <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-6">
              {results.map((result) => {
                const hasPanels = result.monthlyPayment > 0;
                const hasBattery = result.batteryMonthlyPayment !== undefined && result.batteryMonthlyPayment > 0;
                const displayPrice = displayMode === 'HT'
                  ? (result.totalMonthlyPayment || result.monthlyPayment)
                  : (result.totalMonthlyPaymentTTC || result.monthlyPaymentTTC);

                return (
                  <div
                    key={result.duration}
                    className={`bg-white rounded-xl shadow-lg transition-all ${
                      selectedDuration === result.duration
                        ? 'ring-4 ring-green-500 bg-green-50'
                        : 'hover:shadow-xl hover:scale-105'
                    }`}
                  >
                    <div className="p-6">
                      <div className="text-center mb-4">
                        <h4 className="text-xl font-bold text-gray-800 mb-3">
                          {result.duration} ans
                        </h4>

                        <div className="mb-4">
                          {hasPanels && hasBattery ? (
                            <>
                              <div className="text-sm text-gray-600 mb-2">
                                <p>Panneaux : {(displayMode === 'HT' ? result.monthlyPayment : result.monthlyPaymentTTC).toFixed(2)} €</p>
                                <p>Batterie : {(displayMode === 'HT' ? result.batteryMonthlyPayment : result.batteryMonthlyPaymentTTC!).toFixed(2)} €</p>
                                <hr className="my-2 border-green-300" />
                              </div>
                              <p className="text-3xl font-bold text-green-600">
                                {displayPrice?.toFixed(2)} €
                              </p>
                              <p className="text-sm text-gray-600 font-semibold">TOTAL par mois {displayMode}</p>
                            </>
                          ) : (
                            <>
                              <p className="text-3xl font-bold text-green-600">
                                {displayPrice?.toFixed(2)} €
                              </p>
                              <p className="text-sm text-gray-600">
                                {hasBattery ? 'Batterie' : 'Panneaux'} par mois {displayMode}
                              </p>
                            </>
                          )}
                        </div>

                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                          {clientType === 'particulier' ? (
                            <>
                              <p className="text-sm text-blue-800 font-medium">
                                Revenus minimum requis
                              </p>
                              <p className="text-lg font-bold text-blue-600">
                                {result.minRevenue.toLocaleString()} € / an
                              </p>
                              {physicalBattery && (
                                <p className="text-xs text-blue-600 mt-1">
                                  (avec batterie : 7% max)
                                </p>
                              )}
                            </>
                          ) : (
                            <>
                              <p className="text-sm text-blue-800 font-medium">
                                Solvabilité
                              </p>
                              <p className="text-sm font-bold text-blue-600 text-center">
                                Validation sous réserve de l'étude SunLib
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <button
                          onClick={() => setSelectedDuration(selectedDuration === result.duration ? null : result.duration)}
                          className="w-full bg-green-100 text-green-700 py-2 px-4 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center"
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Voir valeurs résiduelles
                        </button>

                        <button
                          onClick={() => handleOfferSelection(result)}
                          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Résumé d'offre
                        </button>
                      </div>
                    </div>

                    {selectedDuration === result.duration && (
                      <div className="border-t border-green-200 bg-green-50 p-4 rounded-b-xl">
                        {hasPanels && hasBattery && result.totalResidualValues ? (
                          <div className="space-y-4">
                            <h5 className="font-semibold text-green-800 mb-3 text-center">
                              Valeurs résiduelles ({clientType === 'particulier' ? 'TTC' : 'HT'})
                            </h5>

                            <div className="grid md:grid-cols-3 gap-3 text-xs">
                              <div className="bg-white p-3 rounded-lg">
                                <p className="font-semibold text-blue-700 mb-2 text-center">Panneaux</p>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                  {result.residualValues.map((residual) => {
                                    const displayValue = clientType === 'particulier' ? residual.valueTTC : residual.value;
                                    return (
                                      <div key={residual.year} className="flex justify-between">
                                        <span className="text-gray-600">An {residual.year}</span>
                                        <span className="font-medium text-blue-700">{displayValue.toLocaleString()}€</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className="bg-white p-3 rounded-lg">
                                <p className="font-semibold text-orange-700 mb-2 text-center">Batterie</p>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                  {result.batteryResidualValues!.map((residual) => {
                                    const displayValue = clientType === 'particulier' ? residual.valueTTC : residual.value;
                                    return (
                                      <div key={residual.year} className="flex justify-between">
                                        <span className="text-gray-600">An {residual.year}</span>
                                        <span className="font-medium text-orange-700">{displayValue.toLocaleString()}€</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className="bg-white p-3 rounded-lg border-2 border-green-500">
                                <p className="font-semibold text-green-800 mb-2 text-center">TOTAL</p>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                  {result.totalResidualValues!.map((residual) => {
                                    const displayValue = clientType === 'particulier' ? residual.valueTTC : residual.value;
                                    return (
                                      <div key={residual.year} className="flex justify-between">
                                        <span className="text-gray-600">An {residual.year}</span>
                                        <span className="font-bold text-green-800">{displayValue.toLocaleString()}€</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : hasBattery && result.batteryResidualValues ? (
                          <>
                            <h5 className="font-semibold text-green-800 mb-3 text-center">
                              Valeurs résiduelles Batterie ({clientType === 'particulier' ? 'TTC' : 'HT'})
                            </h5>
                            <div className="max-h-48 overflow-y-auto space-y-2">
                              {result.batteryResidualValues.map((residual) => {
                                const displayValue = clientType === 'particulier' ? residual.valueTTC : residual.value;
                                return (
                                  <div key={residual.year} className="flex justify-between items-center text-sm">
                                    <span className="text-green-700">Année {residual.year}</span>
                                    <span className="font-medium text-green-800">{displayValue.toLocaleString()} €</span>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        ) : (
                          <>
                            <h5 className="font-semibold text-green-800 mb-3 text-center">
                              Valeurs résiduelles Panneaux ({clientType === 'particulier' ? 'TTC' : 'HT'})
                            </h5>
                            <div className="max-h-48 overflow-y-auto space-y-2">
                              {result.residualValues.map((residual) => {
                                const displayValue = clientType === 'particulier' ? residual.valueTTC : residual.value;
                                return (
                                  <div key={residual.year} className="flex justify-between items-center text-sm">
                                    <span className="text-green-700">Année {residual.year}</span>
                                    <span className="font-medium text-green-800">{displayValue.toLocaleString()} €</span>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {selectedDuration && (
              <div className="text-center text-sm text-gray-600 bg-green-50 p-4 rounded-lg">
                <p>💡 Cliquez sur "Voir valeurs résiduelles" d'une autre durée pour comparer</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesCalculator;
