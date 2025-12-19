"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Componente para enlaces internos animados
const SectionLink = ({
  sectionId,
  children,
}: { sectionId: number; children: React.ReactNode }) => {
  const scrollToSection = () => {
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      const button = element.querySelector("button");
      const isOpen = button?.getAttribute('aria-expanded') === 'true';

      // Función auxiliar para hacer scroll al elemento
      const doScroll = () => {
        const headerOffset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      };

      // Si está cerrada, abrirla primero y luego scroll
      if (button && !isOpen) {
        button.click();
        // Esperar a que se expanda antes de hacer scroll
        setTimeout(doScroll, 200);
      } else {
        // Si ya está abierta, hacer scroll inmediatamente
        doScroll();
      }
    }
  };

  return (
    <span
      onClick={scrollToSection}
      className="text-primary font-semibold cursor-pointer inline-flex items-center gap-1 hover:scale-105 hover:brightness-125 hover:drop-shadow-[0_0_8px_rgba(43,238,121,0.6)] transition-all duration-300 ease-out underline decoration-primary/40 hover:decoration-primary"
    >
      {children}
      <svg
        className="w-3 h-3 inline transition-transform group-hover:translate-x-0.5"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  );
};

export default function LaCuentaPage() {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [formData, setFormData] = useState({
    locutorioId: "",
    email: "",
    subject: "",
    message: "",
    file: null as File | null
  });

  // Auto-open section from sessionStorage (triggered by PLUS link in notes)
  useEffect(() => {
    const autoOpenSection = sessionStorage.getItem('autoOpenSection');
    if (autoOpenSection) {
      sessionStorage.removeItem('autoOpenSection');
      
      setTimeout(() => {
        const sectionId = parseInt(autoOpenSection.replace('section-', ''));
        setOpenQuestion(sectionId);
        
        // Scroll to section after it opens
        setTimeout(() => {
          const element = document.getElementById(autoOpenSection);
          if (element) {
            const headerOffset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }, 300);
      }, 100);
    }
  }, []);

  // Mapa de referencias a IDs de secciones
  const sectionReferences: { [key: string]: number } = {
    "¿Qué fotos de perfil aprobamos?": 3,
    "¿Cómo despertar interés con un perfil en las redes sociales?": 10,
    "Reglas de comportamiento en Locutorio.com.ve": 8,
    "Reglas de la comunidad Locutorio": 8,
    "Información sobre el servicio +PLUS": 9,
    "servicio +PLUS": 9,
    "Por qué se debe verificar el perfil (no solo) en Locutorio": 7,
    "Términos y Condiciones": 8,
    "Términos y condiciones": 8,
  };

  // Función para renderizar texto con enlaces a secciones
  const renderTextWithLinks = (text: string, baseKey: string) => {
    let result: React.ReactNode[] = [];
    const remainingText = text;
    let keyCounter = 0;

    // Buscar todas las referencias
    Object.entries(sectionReferences).forEach(([refText, sectionId]) => {
      const newResult: React.ReactNode[] = [];

      result.forEach((node, idx) => {
        if (typeof node === "string") {
          const parts = node.split(refText);
          parts.forEach((part, partIdx) => {
            if (part)
              newResult.push(
                <span key={`${baseKey}-${keyCounter++}`}>{part}</span>,
              );
            if (partIdx < parts.length - 1) {
              newResult.push(
                <SectionLink
                  key={`${baseKey}-link-${keyCounter++}`}
                  sectionId={sectionId}
                >
                  {refText}
                </SectionLink>,
              );
            }
          });
        } else {
          newResult.push(node);
        }
      });

      result = newResult.length > 0 ? newResult : result;
    });

    // Si no hubo cambios, solo retornar el texto original
    if (result.length === 0) {
      // Procesar solo las menciones que encontremos
      const sortedRefs = Object.entries(sectionReferences).sort(
        (a, b) => b[0].length - a[0].length,
      );
      let textParts: React.ReactNode[] = [remainingText];

      sortedRefs.forEach(([refText, sectionId]) => {
        const newParts: React.ReactNode[] = [];
        textParts.forEach((part) => {
          if (typeof part === "string" && part.includes(refText)) {
            const segments = part.split(refText);
            segments.forEach((seg, segIdx) => {
              if (seg) newParts.push(seg);
              if (segIdx < segments.length - 1) {
                newParts.push(
                  <SectionLink
                    key={`${baseKey}-${refText}-${segIdx}`}
                    sectionId={sectionId}
                  >
                    {refText}
                  </SectionLink>,
                );
              }
            });
          } else {
            newParts.push(part);
          }
        });
        textParts = newParts;
      });

      return textParts;
    }

    return result;
  };

  const faqs = [
    {
      id: 1,
      category: "",
      question: "La cuenta",
      answer: `**Inicio de sesión:**

Para iniciar sesión correctamente primero se necesita crear una cuenta.

**¿Cómo crear cuenta?**

Para crear cuenta necesita establecer NOMBRE - NICK de usuario ("Locutorio ID") que puede ser su nombre, o su apodo. (no es obligatorio usar su verdadero nombre, tampoco nombre de su correo electrónico habitual)

Su "Locutorio ID" – NOMBRE - NICK va a ser visible para todo el resto de usuarios (a lo contrario correo electrónico no sea publico)

Después es primordial escribir su correo electrónico que suele usar habitualmente. Aquí se verifica su nueva cuenta en primer paso. Su correo no se publicará en su perfil. Correo electrónico se escribe dos veces para evitar los errores.

En continuación se necesita establecer la contraseña, que tiene tener como mínimo 8 puntos en un conjunto de letras minúsculas y mayúsculas, número y símbolo. Contraseñas que no cumplen esos mínimos requisitos no serán aceptadas. Contraseña se escribe dos veces para evitar los errores.

A continuación, pulsa botón enviar y en corto tiempo revisa tu correo electrónico que escribiste anteriormente. Te viene mensaje de locutorio.com.ve para verificar tu nueva cuenta. Pulsa en el link dentro de correo o lo copia a pega a tu navegador. Mira bien el apartado "spam" si correo de confirmación no ha caído en este apartado. Al pulsar link dentro de correo se verificará que correo electrónico esta valido y coincide con que estableciste en su nueva cuenta.

¡Este paso es muy importante para posteriormente restablecer tu contraseña en el caso de perderla, olvidarle, o robo de tu cuenta!

**Inicio de sesión por primera vez:**

Escribe su NOMBRE – NICK de usuario ,luego escribe correctamente la contraseña y pulsa entrar.`,
    },
    {
      id: 2,
      category: "",
      question: "¿Cómo crear tu perfil y establecer tu foto de perfil?",
      answer: `**Creación de perfil**

Después de iniciar sesión por primera vez vas ser dirigido a formularios que sería bueno rellenar mas preciso y verdadero posible.

Cada uno de los formularios refleja su propia categoría como son datos básicos: Altura, peso, estatura, color de cabello y los ojos, fecha de nacimiento, continua formulario de tus intereses, que te gusta hacer, qué es que no te gusta, en continuación qué intentas encontrar en Locutorio, con mas detalles a continuación.

Lo recordamos cordialmente llenar lo mas detallado cada casita.

En continuación te vamos a preguntar sobre tu foto de perfil, que tiene ser una foto real, actual de una solo persona, con cara bien visible ubicada en centro de cuadrícula de ajuste de foto.

Cada uno debe tener tu foto publicada en tu perfil con un control estricto para si cumple todos los requisitos. (puede leer más sobre el tema en sección - ¿Qué fotos de perfil aprobamos?)

Puede tener mas fotos en sección de fotos de perfil, pero se mostrará siempre solo uno al que establece como foto principal. Resto de fotos pueden ver otros usuarios en álbum de fotos de perfil.

Para saber mas como rellenar correctamente su perfil, cual foto establecer en su perfil puede leer detalles en ¿Cómo despertar interés con un perfil en las redes sociales?

**Bonificación por crear perfil correctamente:**

Por llenar perfil al menos en 70% → 10 días gratis de servicio +PLUS
Establecer foto real en tu perfil → 10 días gratis de servicio +PLUS
Establecer al mínimo tres fotos en tu perfil → 10 días gratis de servicio +PLUS
Verificación vía WhatsApp o Telegram → 30 días gratis de servicio +PLUS
Validación de perfil real por ID → 30 días gratis de servicio +PLUS
Junto → 3 meses gratis de servicio +PLUS
Cada nuevo contacto invitado y registrado por usted le otorga → 10 días mas para programa +PLUS

Mas información de servicio +PLUS en sección Información sobre el servicio +PLUS`,
    },
    {
      id: 3,
      category: "",
      question: "¿Qué fotos de perfil aprobamos?",
      answer: `**Mis Fotos**

En Locutorio, intentamos que charlen aquí gente real. Por eso nuestro objetivo es tener fotografías reales de personas reales.

**Así se ve una buena foto de perfil:**

La cara es claramente visible (más del 50% de la cara) y está en el cuadrícula para cargar una foto.
La edad de la foto coincide con la edad del perfil.
La foto te muestra como propietario de la cuenta (no puede ser del perfil de otra persona)

**Una mala foto reduce tus posibilidades de que se te acerquen**

Si viniste a Locutorio con el propósito de conocer personas, una buena foto de perfil es fundamental. Los siguientes consejos le dirán qué es lo que definitivamente no le interesará a la gente:

No puedo ver bien tu cara
Hay más personas en la foto.
Se utilizan modificaciones gráficas y de otro tipo que afectan significativamente la cara (filtros, cara pintada, cara borrosa, mosaico)

¡Si no se puede ver bien tu rostro, estás en una foto con un amigo o usaste un filtro que distorsionó tu rostro, no aprobaremos tu foto!

**¡No puede estar en las fotos de perfil!**

Símbolos que promuevan la opresión de individuos o grupos, la difamación racial o que de otro modo sean contrarios a las leyes de la Venezuela o leyes internacionales.

Direcciones URL, números de teléfono u otros datos personales

No pueden ser descargados de Internet (de un banco de fotografías, personajes famosos)

Armas de cualquier tipo

Cigarrillos y alcohol

Poses eróticas o demasiado provocativas. Contenido explícito

Contenido inapropiado, es vulgar, contiene inscripciones vulgares

**¿Cómo sabré que has aprobado mi foto?**

Ya sea que aprobemos su foto o no, recibirá un mensaje MP (mensaje rápido) de nuestra parte: un usuario con el apodo "Locutorio".
Aprobamos las fotos en un plazo máximo de 24 horas, pero normalmente las aprueba en unos minutos.

En caso de que no aprobemos su foto, lea atentamente estas recomendaciones y reglas.`,
    },
    {
      id: 4,
      category: "",
      question: "Contraseña perdida",
      answer: `**Contraseña**

**1 - Recuperación o reseteo de la contraseña**

Para obtener una nueva contraseña, debe completar el formulario de recuperación de contraseña.
Es necesario introducir un nombre de usuario (Locutorio ID) y confirmar con el botón Solicitar nueva contraseña.

**La recuperación de contraseña funciona a través de:**

correo electrónico alternativo
número de teléfono móvil
Preguntas de control (si se ingresaron en el pasado)

Si ha completado al menos uno de estos datos en su cuenta, la contraseña se puede restablecer.

En el correo electrónico que escribiste cuando creaste la cuenta obtienes link para cambiar la contraseña.
Al pulsar link, vas ser dirigido al página donde escribes nueva contraseña, lo repites una vez mas y envíalas.

**2 - Cuenta cancelada debido a inactividad a largo plazo**

Si no inicia sesión en la cuenta durante un período prolongado, (mínimo 6 meses) esta cuenta se cancelará después de la inactividad en el sentido de las condiciones generales del servidor Locutorio.com.ve.
Después de la cancelación, la cuenta queda reservada durante aproximadamente otros 3 meses para el siguiente registro.
En este periodo se puede "reactivar" escribiendo y llenando formularlo a nuestro contacto

**3 - Inicio de sesión bloqueado**

Si ve el mensaje 'El inicio de sesión en su cuenta ha sido bloqueado temporalmente, vuelva a intentarlo más tarde' al iniciar sesión.

El acceso a la cuenta se ha bloqueado temporalmente debido a que se ingresó repetidamente (mas como 3x) incorrectamente la contraseña de inicio de sesión. Por razones de seguridad, el inicio de sesión se bloquea durante 30 minutos. Después de este tiempo, puedes intentar iniciar sesión en tu cuenta nuevamente. Si se repite mismo escenario cuenta se bloquea para 60 minutos, y al repetir otra vez lo mismo se bloqueará para 24 horas.

En el caso de que al iniciar sesión se muestre la información **"El usuario está bloqueado por infracción de las reglas"**. El bloqueo es permanente y no se puede deshacer.
La cuenta ha sido bloqueada por violación de las reglas de la comunidad. Las reglas de comunicación en nuestro servicio Locutorio se pueden encontrar en: Reglas de comportamiento en Locutorio.com.ve.
Si está interesado en investigar el motivo del bloqueo de su cuenta, puede contactarnos en contacto`,
    },
    {
      id: 5,
      category: "",
      question: "Seguridad de la cuenta",
      answer: `**Seguridad de la cuenta en Locutorio.com.ve**

Es posible proteger su cuenta en nuestro servicio Locutorio.com.ve a través de una dirección de correo electrónico y numero de teléfono. El número de teléfono de seguridad de la cuenta no se utiliza con fines de marketing y tampoco es accesible para otros usuarios.

**Para proteger sus datos, nunca proporcione su número de teléfono o dirección de correo electrónico para la verificación de la cuenta a otra persona.**

**1 - cambio de contraseña**
Puede cambiar su contraseña después de iniciar sesión en su cuenta en la sección 'Configuración de la cuenta' Locutorio, subsección 'Cambio de contraseña'.

**2 - Inicio de sesión desconocido**

Si sospecha que su cuenta ha sido utilizada indebidamente, le recomendamos que:

a) Cambiar su contraseña inmediatamente, si aún no lo ha hecho,

b) Consulte la sección Lista de inicios de sesión (en la barra de menú, vaya al elemento con el nombre de su apodo, debajo del cual verá una oferta para ingresar a la sección mencionada), en la que verá cuándo de dónde y a qué hora se realizaron inicios de sesión de su cuenta.

Si alguien más adivinó y luego cambió la contraseña de su cuenta, puede restablecerla utilizando los elementos que utilizó para proteger su cuenta (número de teléfono/correo electrónico/preguntas establecidas) en el sitio ¿Olvidaste tu contraseña?

**3 - Mal uso de datos personales**

Para proteger sus datos, nunca proporcione su número de teléfono o dirección de correo electrónico para la verificación de la cuenta a otra persona.

Si tiene pruebas de que otro usuario de nuestro servicio Locutorio.com.ve, está haciendo un uso indebido de sus datos personales (número de teléfono, foto), contáctenos en contacto

Al mismo tiempo, le recomendamos que también se ponga en contacto con la policía de la República Bolivariana de Venezuela en relación con el asunto mencionado anteriormente.

**4 - Mensajes de correo electrónico fraudulentos**

¡Nunca proporcione su información de inicio de sesión a otra persona!

El operador del servicio Locutorio.com.ve nunca solicita datos de inicio de sesión (nombre de cuenta + contraseña) a sus usuarios.

En caso de que se te haya enviado un mensaje de correo electrónico fraudulento a su cuenta, reenvíe dicho mensaje a la dirección contacto`,
    },
    {
      id: 6,
      category: "",
      question: "¿Por qué no puedo enviar más mensajes?",
      answer: `**¿Por qué no puedo enviar más mensajes?**

Es posible que te hayas hecho esta pregunta mientras usabas Locutorio de forma más activa.

**¿Por qué es así y qué queremos lograr en Locutorio?**

Como sucede en Internet, cada servicio limitado eventualmente será abusado por un pequeño grupo de personas que no tienen intenciones puras.
Ya sean varios estafadores que intentan obtener sus contraseñas o personas que necesitan insultar, intimidar o acosar a otros.
Según las estadísticas, este es un pequeño porcentaje de usuarios activos de Locutorio y de cualquier sitio en el Internet.
Sin embargo, son las personas las que generan la mayor cantidad de contenido spam (reportado).
Dado que hemos permitido que cualquiera envíe mensajes de inicialización de MP (mensajes privados) ilimitados o escriba en salas en el Chat, esas personas saben cómo actuar y abusar adecuadamente de dicho estado.
No solo nos perjudican a nosotros, sino especialmente a ustedes, nuestros clientes.

**¿Cuándo puedo encontrar tales límites?**

En Locutorio estamos empezando a introducir más límites a la hora de escribir mensajes en el Chat o en MP (mensajes privados).
Sin embargo, no tienes que preocuparte siempre que utilices Locutorio como la mayoría de los demás usuarios.
Marcamos los límites por lo que, si es posible, no te restrinjan de ninguna manera con la comunicación normal, y especialmente si te comportas de acuerdo con los Términos y Condiciones Generales.

En la mayoría de los casos, encontrará límites si aún no tiene un número de teléfono verificado.
La verificación del numero de teléfono es un procedimiento simple y seguro para proteger su cuenta contra robo o uso indebido.
Puedes encontrar más información sobre por qué es bueno tener un número de teléfono verificado en el artículo: Por qué se debe verificar el perfil (no solo) en Locutorio.

No publicamos el número de teléfono verificado en ninguna parte y ninguna instancia se almacena de forma segura de acuerdo con la regulación de uso de datos personales.

Tampoco lo utilizamos para buscar otras personas en locutorio ni lo utilizamos con fines de marketing.`,
    },
    {
      id: 7,
      category: "",
      question: "¿Por qué la cuenta tiene ser verificada?",
      answer: `**¿Por qué se debe verificar el perfil (no solo) en Locutorio?**

Si usas Locutorio, seguramente te ha llamado la atención la posibilidad de verificar tu número de teléfono.
¿Por qué queremos eso cuando afirmamos que Chat es anónimo?

**Seguridad de la cuenta**

¡Nada más y nada menos!
El número de teléfono o la dirección de correo electrónico verificados se almacenan de forma segura y ningún otro usuario de los servicios de Locutorio tiene acceso a ellos.
Gracias al numero verificado, podemos enviarle fácilmente una nueva contraseña en caso de que olvide la anterior.
Gracias a las cuentas verificadas, podremos luchar mejor contra los distintos bots que te envían mensajes no solicitados.
También podremos tomar mejores medidas contra los estafadores o las personas que tienen una necesidad crónica de crear cada vez más cuentas y utilizarlas para acosar a las personas que vinieron a Locutorio para divertirse o conocer a alguien nuevo.

**Se preserva el anonimato**

¡El anonimato de nuestros usuarios es lo primero!
No utilizamos un número de teléfono verificado ni una dirección de correo electrónico para emparejarnos con otros usuarios como lo hacen otras redes sociales.
Son datos personales y seguirán siendo personales con nosotros.
No los utilizaremos para publicidad dirigida ni proporcionaremos estos datos a terceros.
Puede contar con el hecho de que, si ingresa dicha información, nunca le enviaremos un anuncio basado en ella.
Como escribimos anteriormente, el anonimato y la privacidad de nuestros usuarios son muy importantes para nosotros.

**No utilizamos datos personales para relacionarlo con otros usuarios de los servicios de Locutorio ni para rastrear su actividad. El anonimato es primordial para nosotros.**

**Protegiendo a la buena gente**

Sin embargo, con el anonimato, algunas personas pueden tener la impresión de que pueden hacer cualquier cosa, incluso cosas malas, en Internet. Desde acosos con mensajes no solicitados por parte de MP (mensajes privados), pasando por amenazas financieras hasta amenazas de ataques sólo porque alguien tiene otro color de piel, es de otra nacionalidad, tiene otra orientación sexual, etcétera. Y no queremos que Locutorio sea una plataforma donde se tolere ese tipo de comportamiento. Después de todo, este tipo de comportamiento no debería ser tolerado en ningún lugar ni por nadie.

**Todas las plataformas de comunicación luchan contra el acoso a las personas. Por lo tanto, nuestro objetivo es minimizar dicho acoso**

Si bloqueamos a una persona que acosa a otros no queremos que vuelva aquí con otro apodo y vuelva a dañar a los buenos usuarios.
Y eso puede ser muy difícil de lograrse si no tenemos cuentas verificadas.
A las cuentas no verificada, iremos limitando gradualmente las posibilidades en Locutorio. Por ejemplo, no podrán enviar spam a salas ni enviar decenas de MP a nuevos usuarios por limitaciones para esas cuentas.

**Construiremos Buen Chat solo con tu ayuda.**

Si alguien en Locutorio te ataca, te acosa, te engaña (por ejemplo, financieramente) o eres testigo de tal comportamiento, no te lo guardes para ti. Infórmenos sobre dicho usuario lo antes posible.
Tenemos opciones para denunciar mal comportamiento en todo Locutorio y solo podemos tomar medidas contra las personas malas si nos informas.

**Limitaciones de cuentas no verificadas**

Gradualmente se baja montón de mensajes enviados en el Chat y numero de MP, desde 100 mensajes en todas salas de Chat por día y 10 MP (mensajes privados) por día, hasta tal punto que no se puede escribir en salas de Chat, ni iniciar envió de MP (mensajes privados), solo responder a MP (mensajes privados) recibidas

**Limitaciones de cuentas verificadas**

Aunque su cuenta está verificada con numero de teléfono tienes ciertas limitaciones.

No puedes enviar en salas de Chat mensajes repetitivas mas como 3 x (se trata de mensajes enviadas en forma Ctrl+C y Ctrl+V)
No puedes enviar mensajes seguidas parecidas en espacio dentro de un 5 minuto (aquí se trata de mismos mensajes, con leve cambio de palabras – mensajes repetitivos)
No puedes enviar MP (mensajes privados) iniciales para más de 10 personas nuevas por el día/sala`,
    },
    {
      id: 8,
      category: "",
      question: "Reglas de la comunidad Locutorio",
      answer: `**Normas comunitarias de Locutorio**

Locutorio.com.ve es una plataforma para conocer gente nueva. Aquí puede encontrar nuevos amigos, conocer a su alma gemela o simplemente charlar con personas con intereses similares.

Para que todos puedan pasar un rato agradable en Locutorio, contamos con Términos y condiciones que aplican a todos los usuarios.

**Advertencia:**

El incumplimiento de los Términos y condiciones puede resultar en la prohibición permanente de la cuenta. El bloqueo de cuentas por incumplimiento de los Términos y condiciones no será objeto de apelación y la decisión del operador será definitiva.

**VERSIÓN CORTA**

Trata a los demás con respeto. No toleres la grosería, el acoso, la intimidación ni el discurso de odio. Comparta solo contenido apropiado. Los contenidos inapropiados incluyen pornografía, mensajes de spam, amenazas, violencia, mensajes de odio y contenido ilegal. Especialmente el contenido que involucre a niños menores de edad está estrictamente prohibido. Mantenga su información personal segura: nunca la comparta con nadie que no conozca. No utilices tu cuenta para publicidad o actividad comercial. Y, finalmente, sé auténtico. No hacerse pasar por otras personas.

**VERSIÓN LARGA**

**Acoso:**

El acoso puede manifestarse de muchas formas e incluye: mensajes o invitaciones repetidos no deseados, comentarios degradantes, amenazas de violencia, amenazas de revelar información personal de otra persona o de otra manera difamar a una persona.

Los siguientes comportamientos también se consideran acoso:

° Crear una cuenta falsa con el único propósito de contactar o acosar a un usuario específico.
° Continuar contactando a otro usuario después de que le haya pedido repetidamente que deje de hacerlo.
° Compartir o amenazar con compartir imágenes íntimas de otra persona sin su permiso.
° Publicar o amenazar con publicar información de identificación personal de otra persona.
° Acoso hacia cualquier miembro del equipo de Locutorio.com.ve

**Acoso sexual:**

El acoso sexual incluye contacto no deseado, solicitudes no deseadas de favores sexuales y otras conductas de naturaleza sexual.
La siguiente lista incluye ejemplos de acoso sexual, aunque no cubre todos los casos:

° Contacto verbal o físico no deseado, como insultos, comentarios, insinuaciones, piropos o preguntas de naturaleza sexual.
° Tocar, abrazar, besar, acariciar, masajear o rozar de manera inapropiada.
° Exhibición de material sexualmente explícito.
° Solicitudes repetidas de citas o números de teléfono después de que la otra persona haya rechazado tales solicitudes.
° Comentarios explícitos sobre la ropa o el cuerpo de otra persona.
° Mensajes de texto o correos electrónicos no deseados de naturaleza sexual.
° Favores sexuales compartidos.

**Contenido sexual:**

Incluir imágenes o contenido sexual en su perfil no está permitido.

Contenido sexual incluye:

° Pedir imágenes íntimas a cambio de obsequios, beneficios o chantaje de otro tipo.
° Solicitar, compartir, comprar o vender imágenes íntimas o el contenido de conversaciones privadas de una persona sin su consentimiento.
° Solicitar, compartir o vender pornografía a través de mensajes privados o públicos.

**Discurso de odio / Discriminación:**

El discurso de odio es contenido que ataca, amenaza, incita a la violencia o deshumaniza de otro modo a un individuo o grupo de personas por motivos de etnia, país de origen, religión, género, orientación sexual, discapacidad, enfermedad mental o edad.

Está estrictamente prohibido publicar dicho contenido en Locutorio (ya sea en mensajes públicos, mensajes privados, perfiles o álbumes de fotos).

Los siguientes comportamientos se consideran de odio:

° Comentarios o chistes que incitan al odio hacia un individuo o grupo.
° Comentarios discriminatorios basados en etnia, religión, edad, país de origen, discapacidad, género u orientación sexual.
° Solicitar información sobre la raza o religión de un usuario y luego usar esa información para acosarlo.
° Amenazar a un individuo o grupo por las características anteriores.

**Abuso o intimidación:**

La intimidación incluye, entre otros, insultos, maldiciones, amenazas, expresión de odio y acoso.

**Pornografía infantil:**

Cualquier contenido sexual que involucre a menores de edad (personas menores de 18 años) está estrictamente prohibido en Locutorio. Todas las cuentas que involucren a menores en este sentido serán reportadas inmediatamente a las autoridades locales del país correspondiente. Una violación de esta regla resultará en una prohibición permanente de su cuenta.

**Violencia, extremismo y terrorismo:**

Está estrictamente prohibido publicar contenido que apoye el extremismo o el terrorismo, incluido el contenido que lo glorifique o defienda.

El contenido violento incluye:

° Glorificación de actos de violencia.
° Publicar imágenes gráficas de violencia.
° Amenazar a un individuo o grupo con violencia.

**Comportamiento ilegal:**

Es necesario que todos los usuarios de Locutorio.com.ve respeten las leyes de la República Bolivariana de Venezuela.

Los siguientes comportamientos están estrictamente prohibidos:

° Cualquier acto ilegal incluye, entre otros, el uso de drogas, la trata de personas, la venta de productos regulados, el uso no autorizado de tarjetas de crédito o cuentas, el lavado de dinero, el fraude, el chantaje, etc.

**Fraudes – comportamiento fraudulento:**

Consideramos fraude cualquier actividad engañosa destinada a proporcionar una ventaja injusta o dañar a otra persona. Esto puede incluir, entre otros: crear múltiples cuentas para evitar restricciones o suspensiones, falsificar información de perfil para engañar a otros usuarios, o usar Locutorio para estafas financieras.

**Noticias falsas:**

La difusión de información deliberadamente falsa o engañosa está prohibida. Esto incluye compartir afirmaciones verificablemente falsas sobre eventos, personas, o productos con la intención de engañar o manipular a otros usuarios.

**Publicidad, anuncios, clasificados:**

Locutorio.com.ve no es una plataforma publicitaria. Está prohibido usar el servicio para publicidad comercial, spam o promoción de productos o servicios sin autorización previa.

El uso no autorizado incluye:

° Enviar mensajes masivos con contenido promocional.
° Usar el perfil para promocionar negocios, productos o servicios.
° Solicitar dinero o donaciones.
° Promocionar otras plataformas de redes sociales o servicios de la competencia.

**Reporte de violaciones:**

Si observas algún comportamiento que viole estas normas comunitarias, repórtalo inmediatamente al equipo de Locutorio. Todas las denuncias se investigan y se toman medidas apropiadas.

**Juntos construimos una comunidad segura y respetuosa para todos.**`,
    },
    {
      id: 9,
      category: "",
      question: "Información sobre el servicio PLUS",
      answer: `**Información sobre el servicio PLUS**

En Locutorio es todo totalmente gratis.
No se paga por crear una cuenta, no se paga por publicar ni ver fotos, tampoco se paga por crear foto álbumes, ya públicos o solo para amigos o protegidos por contraseña.
Tampoco se paga por usar todas las salas en el Chat para charla o comunicarse por MP
Locutorio se puede usar totalmente sin pago alguno, además prácticamente sin publicidad molesta.

Existe solo una excepción y se llama Servicio PLUS de Locutorio

Es una ampliación de los servicios que ofrece a sus usuarios Locutorio

**¿Que ofrece servicio Locutorio PLUS?**

Usuario puede ver quien ha visitado su perfil
Usuario puede ver quien le gusta o lo tiene simpatías
Usuario puede ver quien lo agrego a sus amigos
Usuario puede ver quien lo ha enviado una oferta a encuentro
Usuario usando MP puede ver toda la historia de comunicación
Se enviará la notificación por SMS que le informará de nuevos MP, y otras actividades en su cuenta, cuando no esta conectado (depende de permisos en los ajustes de la cuenta)
Otros servicios dependiendo de oferta temporal

**¿Cuanto cuesta servicio Locutorio PLUS?**

1 mes = 1 USD
3 meses = 2 USD
6 meses = 4 USD
9 meses = 7 USD
12 meses = 10 USD o equivalente en Bolívares dependiendo cambio actual

Pagos se pueden realizar con Pago Móvil o con PayPal
También será posible regalar servicio PLUS a otros usuarios por ejemplo como regalo de cumpleaños.`,
    },
    {
      id: 10,
      category: "",
      question: "¿Cómo despertar interés con un perfil en las redes sociales?",
      answer: `**Cómo impresionar con un perfil en las redes sociales**

Así como en la vida real te presentas a la gente con tu forma de hablar, tu vocabulario y tu vestimenta, también es posible presentarte en Internet.
Incluso tu perfil te dará la oportunidad de pensar en cómo aparecerás y te mostrarás de la mejor manera posible.
Te traemos algunos consejos sobre cómo llamar la mayor atención posible con tu perfil.

**Real vs. vida virtual**

Imagínese observar a alguien durante 30 segundos en un parque en un banco. Se puede decir mucho sobre él en este corto tiempo. La ropa o el cabello bien arreglado son los que más revelan. En el mundo de las redes sociales, este es el primer contacto que ven todos los visitantes de su perfil: fotos y álbumes.

Además, una persona en el parque te contará (sin querer) mucho más, incluso sin dirigirse a ella. Lenguaje corporal, movimientos, gestos... según eso, si está nervioso o, por el contrario, tranquilo.
Sus discursos, opiniones y todo lo que pueda distorsionar la opinión sobre el está oculto en Internet. Lo que usaremos a nuestro favor a la hora de crear un buen nombre :)

¡No, no mentiremos sobre nosotros mismos en Internet! Simplemente no tenemos por qué desanimar inmediatamente a la señora/señor con nuestros pequeños malos hábitos, que en la vida real ella/el podría haber notado antes de iniciar una conversación con nosotros.

**¡El contenido de tu perfil lo dice todo sobre ti!**

¿Alguna vez te ha gustado una chica/chico en el bar, pero cuando empezó a hablar, te dirigiste directamente a la otra mesa? Vulgarismo, ego, mala educación y opiniones increíblemente peculiares.
El contenido que compartes en tu perfil puede revelar las mismas cosas.

**¿Qué es lo que más interesa a las mujeres?**

Al 86% de las mujeres les gusta ver en el perfil de un hombre qué estudiaste y cuál es tu educación completa.

El 100% de las mujeres entrevistadas están interesadas en qué campo el trabaja. No porque estuvieran buscando gente rica, pero en este caso confirmaron que del puesto de trabajo se puede deducir cierta responsabilidad y tu estatus.

Dado que hoy en día muchas personas buscan pareja a través de las redes sociales, no es de extrañar que una vez más todas las mujeres entrevistadas respondieran a la pregunta: '¿Te interesa información sobre estado civil en tu perfil?'. -definitivamente fue un SI

Los pasatiempos te permiten saber que puedes tener una conversación juntos... y las mujeres también lo saben.
A cada usuario entrevistado le gustaría que el hombre % de las mujeres se interesaron por saber si sus aficiones incluyen alguna actividad deportiva.

**Con un perfil bien completo, tienes muchas más posibilidades de obtener una respuesta. Va por ambos sexos**

Por el contrario, fueron pequeña memoria que buscaron en los perfiles de hombres qué comida comes, qué música escuchas, cuál es tu color favorito o incluso cuál es tu signo del zodiaco. La capacidad de comunicarse en lenguas extranjeras también acabó en las últimas posiciones.

Basta con saber comunicarse educadamente y decentemente en tu lengua natal

**¿Cómo impresionar con una foto de perfil?**

Las fotos de músculos no encajan. Así lo confirmaron varias chicas entrevistadas que buscan pareja en Internet. Si practicas deporte y vas al gimnasio, demuéstralo más en las actividades deportivas de aspecto natural que realices. No fotos retocadas en el camerino frente al espejo.

**¿Qué tener en los álbumes de fotos?**

Presentarse en álbumes de fotos con cosas caras para demostrar que los "más altos estándares" son de gran importancia no ayuda mucho. Es decir, a menos que estés buscando chicas para conocer que se "especializan" exactamente apreciar esto.

Las fotos de la vida cotidiana mostrarán a los visitantes de tu perfil qué tipo de cosas te gustan. Nadie necesita saber que apenas te animas a salir a correr, o que el orden de tu habitación en la foto te costó mucho esfuerzo antes de tirar lo todo detrás de la puerta antes de tomar la foto.

Lo importante es que las fotos sean reales. Tu vida está en ellos (solo en la medida en que quieras revelarlo) y que hay cosas a tu alrededor que te importan y te hacen feliz.

Si te acercas a una mujer de tu barrio, le hará sentir que tenéis algo en común -porque conoce los mismos lugares-, lo que también aumenta la credibilidad de vuestro perfil. Si a ella también le gustan tus actividades, es muy probable que obtengas una respuesta.

**¿Por qué tener un perfil atractivo?**

Porque con la popularidad de las redes sociales y la prevalencia de los dispositivos móviles, cada vez más personas abandonan el contacto personal (porque 'cuesta' tiempo conocer a alguien y puede que no siempre convenga a ambos) y pasan al contacto a través de las redes sociales (es rápido y el enlace esperará por persona mientras tenga tiempo).`,
    },
    {
      id: 11,
      category: "",
      question: "¿Cómo no caer en la trampa de los estafadores en el Internet?",
      answer: `**¿Cómo no caer en la trampa de los estafadores en Internet?**

Los estafadores en Internet suelen ser muy astutos. Intentan extraernos información diversa para poder acceder más fácilmente a nuestras cuentas de Facebook, Instagram y Locutorio. Puedes leer consejos sobre cómo no enamorarte de ellos en este artículo.

Imagínese la situación. Vas caminando por la calle y alguien que no conoces te pregunta si puedes prestarle tu documento de identidad, sólo para hacerse unos tramites rapidito para él. ¿Qué vas a hacer? ¿Le darás tu identificación o no?

Cualquier persona razonable ya sospechería que detrás de tal petición hay algo nefasto. ¿Para qué sirve tu cédula de identidad? ¿Por qué le interesaría a alguien? Pero ¿por qué la gente no piensa lo mismo en las redes sociales cuando le dan su número de teléfono, su contraseña, o su numero de tarjeta bancaria a alguien?

Uno de los casos más frecuentes de uso indebido de datos personales es el uso indebido de un número de teléfono. Los vendedores suelen disfrazarlo de 'caridad' o de un esfuerzo por ayudar a alguien. Por ejemplo, 'Necesito votar por una recaudación de fondos para mi sobrina enferma, pero no quieren aceptar mi número de teléfono. ¿Puedes ayudarme? No te cuenta nada'. O 'Me bloqueé en Locutorio y me pide un código en mi móvil, simplemente no puedo quedó sin batería, ¿puedo enviarlo al tuyo y me puedes decir el código? Es gratis, solo necesito acceder a mis correos.'.

Estas parecen solicitudes decentes. Con énfasis en que no te costará nada, que es gratis. Y que ayudarás a una persona necesitada. Después de todo, ¿quién no ayudaría cuando es gratis, ¿verdad? Pero, ¿que pasa si le das a alguien tu número de teléfono? De nuevo, ¿quién no ayudaría? Realmente te van a dar y nuevo, y muchas posibilidades, pero aquí te presentamos algunos de los casos más comunes de mal uso del número de Internet.

**1. Verificación de una cuenta ajena con tu número**

Le das el número al estafador, él lo agrega a su cuenta en Facebook, Chat o en cualquier otro lugar, y felizmente puede cometer actividades delictivas directamente en tu nombre. La cuenta puede tener un nombre o apodo falso, pero no está vinculada a tu número de teléfono. Si al final el autor cometiera una actividad delictiva a través de dicha cuenta, usted sería en realidad cómplice, porque el teléfono el numero asignado a la cuenta lo asigna el operador a su nombre.

**2. Encontrar sus cuentas para diversos servicios**

El proceso es simple: le das a alguien tu número de teléfono, lo agrega a sus contactos telefónicos y luego varias aplicaciones que puedes elegir en tu perfil como una nueva persona a la que pueden llegar a conocer. Así lo hacen Facebook, Instagram, WhatsApp y muchas otras aplicaciones a las que el usuario da permiso para acceder a los contactos. Valorando tu privacidad y compartir tus datos personales también en otras redes, le recomendamos cambiar este comportamiento y prohibir que las aplicaciones accedan a sus contactos. No solo se protegerá a usted mismo, sino también a sus seres queridos.

**3. Chantaje**

Continuación del punto 2.
El estafador encontró su cuenta en la red social. Verá todo su perfil público, todas las fotos de acceso público, su lista de amigos, etc. Empieza a recopilar material para chantajearte. Puede empezar a escribirte con un perfil falso con el nombre de tu compañero o es pequeño. Él te preguntará de tal manera que comenzarás a confiar en él. Creyendo que es un viejo conocido al que no ves desde hace mucho tiempo, empiezas a escribirle detalles de tu vida que tal vez no le cuentes a nadie. Sin embargo, el estafador anota todo cuidadosamente y crea un perfil sobre usted, que luego puede utilizar para chantajearlo revelando información específica, por ejemplo, a su familia, amigos, etc.

**¿Cómo defenderse?**

La respuesta es simple: no des tu número de teléfono a cualquier persona desconocida. Ningún servicio de internet te pide tu número a través de una persona o chat. Todos los servicios serios tienen el proceso de verificación automatizado hasta cierto punto para que nadie pueda obtener su número.

En Locutorio podrás verificar tu número de teléfono a través de una sencilla pantalla, donde solo deberás ingresar tu número y luego un código de cuatro dígitos que te enviaremos vía SMS

Si verifica su número de teléfono de esta manera, protegerá su cuenta contra posibles robos. Al mismo tiempo, podrás acceder a tu cuenta muy fácilmente si olvidas tu contraseña.

Al mismo tiempo, si cree que alguien ha accedido a su cuenta o que alguien está intentando obtener sus datos personales en Locutorio, comuníquese con nuestro departamento de ayuda y soporte en contacto. Junto con su ayuda, intentaremos eliminar a estos estafadores.`,
    },
    {
      id: 12,
      category: "",
      question:
        "Tú también puedes hacer de Locutorio un lugar más seguro en el Internet",
      answer: `**Abuso del Servicio**

No abuse de Locutorio y sus servidores para ningún propósito, por ejemplo:

° Creación de varias cuentas: toleramos un máximo de 2 cuentas por persona.
° Enviar spam a través del correo electrónico MP(mensajes privados), enviar los mismos mensajes a una gran cantidad de usuarios. Por ejemplo, "Hola a todas las mujeres del barrio".
° Enviar spam en salas: escribir el mismo mensaje en todas las salas. ¡Mensajes como "Quién escribirá", "Mira mi Instagram"! y similares
° Spamming en "Encuentros": voto positivo/negativo para todos los usuarios en poco tiempo.
° En general, el envío masivo de mensajes privados o públicos que invitan a visitar otros sitios (sitios pornográficos y sexuales, sitios de carácter comercial, perfiles en otras redes sociales)

Estamos trabajando para hacer de Locutorio un lugar seguro para todos. Es por eso que decidimos verificar a los usuarios y establecer múltiples límites para aquellos que no verifican su número.

**Límites de Locutorio para cuentas no verificadas por número de teléfono:**

Puedes enviar un máximo de 100 mensajes por día a Chat (esta es la suma de todos tus mensajes en todas las salas públicas)
Puedes enviar un máximo de 10 RP de inicialización por día
Esto se baja gradualmente hasta en cero mensajes en Chat por día y cero MP(mensajes privados), solo respuestas`,
    },
  ];

  return (
    <div className="min-h-screen bg-connect-bg-dark text-white font-display">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-connect-border bg-connect-bg-dark/80 backdrop-blur-md px-6 py-4">
        <Link href="/connect/tutorial" className="flex items-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="text-sm font-medium text-connect-muted">
            Volver al tutorial
          </span>
        </Link>
        <Link href="/connect" className="flex items-center gap-2">
          <div className="size-8 text-primary bg-primary/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight">LoCuToRiO</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-teal-600 mb-6">
            <svg
              className="w-10 h-10 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Locutorio Guía de Uso
          </h1>
          <p className="text-connect-muted text-lg max-w-2xl mx-auto">
            Aquí encontrarás toda la ayuda que necesitas para buscar pareja,
            conocer nuevos amigos o simplemente charlar un rato de cosas que te
            interesan.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Ayuda:</h2>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq.id} id={`section-${faq.id}`}>
                <button
                  onClick={() =>
                    setOpenQuestion(openQuestion === faq.id ? null : faq.id)
                  }
                  aria-expanded={openQuestion === faq.id}
                  className="w-full text-left p-4 rounded-xl bg-connect-card border border-connect-border hover:border-primary/50 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-white font-medium group-hover:text-primary transition-colors">
                        {faq.question}
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 text-primary transition-transform flex-shrink-0 ml-4 ${openQuestion === faq.id ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>

                {/* Answer Bubble */}
                {openQuestion === faq.id && (
                  <div className="mt-2 ml-4 p-6 rounded-xl bg-connect-bg-dark border-l-4 border-primary animate-in slide-in-from-top-2 duration-300">
                    <div className="text-connect-muted leading-relaxed whitespace-pre-line space-y-4">
                      {faq.answer.split("\n\n").map((paragraph, idx) => {
                        // Mapa de referencias a IDs de secciones
                        const sectionMap: { [key: string]: number } = {
                          "¿Qué fotos de perfil aprobamos?": 3,
                          "¿Cómo despertar interés con un perfil en las redes sociales?": 10,
                          "Reglas de comportamiento en Locutorio.com.ve": 8,
                          "Reglas de la comunidad Locutorio": 8,
                          "Información sobre el servicio +PLUS": 9,
                          "servicio +PLUS": 9,
                          "Por qué se debe verificar el perfil (no solo) en Locutorio": 7,
                          "Términos y Condiciones": 8,
                          "Términos y condiciones": 8,
                        };

                        // Procesar el párrafo
                        let processedParagraph: React.ReactNode[] = [];
                        const remainingText = paragraph;

                        // Primero manejamos el texto en negrita
                        const boldParts = remainingText.split(/(\*\*.*?\*\*)/g);

                        processedParagraph = boldParts.map((part, i) => {
                          if (part.startsWith("**") && part.endsWith("**")) {
                            return (
                              <strong
                                key={`bold-${i}`}
                                className="text-white font-bold"
                              >
                                {part.slice(2, -2)}
                              </strong>
                            );
                          }

                          // Buscar referencias a secciones en el texto normal
                          let processedPart: React.ReactNode[] = [part];
                          Object.entries(sectionMap).forEach(
                            ([sectionName, sectionId]) => {
                              const newProcessed: React.ReactNode[] = [];
                              processedPart.forEach((segment, segIdx) => {
                                if (typeof segment === "string") {
                                  const segments = segment.split(sectionName);
                                  segments.forEach((seg, segmentIdx) => {
                                    if (segmentIdx > 0) {
                                      newProcessed.push(
                                        <SectionLink
                                          key={`link-${i}-${segIdx}-${segmentIdx}`}
                                          sectionId={sectionId}
                                        >
                                          {sectionName}
                                        </SectionLink>,
                                      );
                                    }
                                    if (seg) newProcessed.push(seg);
                                  });
                                } else {
                                  newProcessed.push(segment);
                                }
                              });
                              processedPart = newProcessed;
                            },
                          );

                          return <span key={`part-${i}`}>{processedPart}</span>;
                        });

                        return (
                          <p key={idx} className="mb-3">
                            {processedParagraph}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Card */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30 p-8 text-center mt-12">
          <h3 className="text-2xl font-bold text-white mb-3">
            ¿Necesitas más ayuda?
          </h3>
          <p className="text-connect-muted mb-6">
            Si no encuentras la respuesta a tu pregunta, nuestro equipo de
            soporte está aquí para ayudarte.
          </p>
          <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-connect-bg-dark hover:brightness-110 font-bold">
                Contactar Soporte
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white text-gray-900 max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold text-center mb-2">
                  Contáctanos
                </DialogTitle>
                <DialogDescription className="text-center text-gray-600">
                  ¿Tienes alguna sugerencia, pregunta o has encontrado un error?
                  <br />
                  Contáctanos, estaremos encantados de ayudarte.
                </DialogDescription>
              </DialogHeader>

              <form className="space-y-4 mt-6" onSubmit={(e) => {
                e.preventDefault();
                // Aquí iría la lógica para enviar el formulario
                console.log('Formulario enviado:', formData);
                setIsContactOpen(false);
                // Reset form
                setFormData({
                  locutorioId: "",
                  email: "",
                  subject: "",
                  message: "",
                  file: null
                });
              }}>
                <div>
                  <Input
                    placeholder="Locutorio ID"
                    value={formData.locutorioId}
                    onChange={(e) => setFormData({...formData, locutorioId: e.target.value})}
                    className="border-gray-300"
                    required
                  />
                </div>

                <div>
                  <Input
                    type="email"
                    placeholder="Correo electrónico"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="border-gray-300"
                    required
                  />
                </div>

                <div>
                  <Input
                    placeholder="Asunto"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="border-gray-300"
                    required
                  />
                </div>

                <div>
                  <Textarea
                    placeholder="Mensaje"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="border-gray-300 min-h-[200px] resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Adjuntar archivo
                  </label>
                  <Input
                    type="file"
                    onChange={(e) => setFormData({...formData, file: e.target.files?.[0] || null})}
                    className="border-gray-300"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2"
                  >
                    enviar
                  </Button>
                </div>
              </form>

              <div className="text-center text-sm text-gray-500 mt-6 pt-4 border-t">
                Locutorio.com.ve ayuda © 2025
              </div>
            </DialogContent>
          </Dialog>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-connect-border">
          <Link href="/connect/tutorial">
            <Button
              variant="ghost"
              className="text-connect-muted hover:text-white"
            >
              ← Volver al tutorial
            </Button>
          </Link>
          <Link href="/inicio">
            <Button className="bg-primary text-connect-bg-dark hover:brightness-110">
              Ir a Mi Espacio Personal →
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-connect-border py-6 text-center text-sm text-connect-muted mt-20">
        <p>© 2024 - 2025 Locutorio.com.ve Venezuela</p>
      </footer>
    </div>
  );
}
