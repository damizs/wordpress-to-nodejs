/*
|--------------------------------------------------------------------------
| Mensagens de validação (VineJS) em pt-BR
|--------------------------------------------------------------------------
|
| Este preload define um messagesProvider global para o VineJS, traduzindo
| as mensagens de erro padrão (que vêm em inglês) para o português do Brasil.
| Como `vine.messagesProvider` é uma propriedade pública da instância singleton
| do VineJS, sobrescrevê-la aqui afeta TODOS os validators do sistema
| (app/validators/*.ts e validators inline), sem precisar repassar mensagens
| em cada `vine.compile(...)`.
|
| Carregado via `adonisrc.ts` → preloads (ambiente web), depois do
| vinejs_provider já ter registrado a instância padrão do VineJS.
|
*/

import vine, { SimpleMessagesProvider } from '@vinejs/vine'

/**
 * Mensagens por regra. Os placeholders disponíveis variam por regra:
 * - {{ field }}  → nome do campo (traduzido pelo mapa `fields` abaixo)
 * - {{ min }} / {{ max }} / {{ size }} → limites da regra
 * - {{ otherField }} → campo de comparação (confirmed, sameAs, etc.)
 * - {{ values }} / {{ expectedValue }} → valores esperados
 */
const messages = {
  // Presença / tipos base
  'required': 'O campo {{ field }} é obrigatório.',
  'string': 'O campo {{ field }} deve ser um texto.',
  'number': 'O campo {{ field }} deve ser um número.',
  'boolean': 'O campo {{ field }} deve ser verdadeiro ou falso.',
  'object': 'O campo {{ field }} deve ser um objeto.',
  'array': 'O campo {{ field }} deve ser uma lista.',
  'record': 'O campo {{ field }} deve ser um objeto.',
  'tuple': 'O campo {{ field }} deve ser uma lista.',

  // Formatos
  'email': 'Informe um e-mail válido no campo {{ field }}.',
  'url': 'O campo {{ field }} deve ser uma URL válida.',
  'activeUrl': 'O campo {{ field }} deve ser uma URL válida e ativa.',
  'regex': 'O formato do campo {{ field }} é inválido.',
  'mobile': 'O campo {{ field }} deve ser um número de celular válido.',
  'creditCard': 'O campo {{ field }} deve ser um número de cartão válido.',
  'passport': 'O campo {{ field }} deve ser um número de passaporte válido.',
  'postalCode': 'O campo {{ field }} deve ser um CEP válido.',
  'ascii': 'O campo {{ field }} deve conter apenas caracteres ASCII.',
  'iban': 'O campo {{ field }} deve ser um IBAN válido.',
  'jwt': 'O campo {{ field }} deve ser um token JWT válido.',
  'coordinates': 'O campo {{ field }} deve conter latitude e longitude válidas.',
  'alpha': 'O campo {{ field }} deve conter apenas letras.',
  'alphaNumeric': 'O campo {{ field }} deve conter apenas letras e números.',
  'ipAddress': 'O campo {{ field }} deve ser um endereço IP válido.',
  'uuid': 'O campo {{ field }} deve ser um UUID válido.',
  'ulid': 'O campo {{ field }} deve ser um ULID válido.',
  'hexCode': 'O campo {{ field }} deve ser um código de cor hexadecimal válido.',

  // Tamanho de texto
  'minLength': 'O campo {{ field }} deve ter no mínimo {{ min }} caracteres.',
  'maxLength': 'O campo {{ field }} deve ter no máximo {{ max }} caracteres.',
  'fixedLength': 'O campo {{ field }} deve ter exatamente {{ size }} caracteres.',
  'notEmpty': 'O campo {{ field }} não pode ficar vazio.',

  // Comparação entre campos
  'confirmed': 'A confirmação do campo {{ field }} não confere.',
  'sameAs': 'O campo {{ field }} deve ser igual ao campo {{ otherField }}.',
  'notSameAs': 'O campo {{ field }} deve ser diferente do campo {{ otherField }}.',
  'endsWith': 'O campo {{ field }} deve terminar com {{ substring }}.',
  'startsWith': 'O campo {{ field }} deve começar com {{ substring }}.',

  // Conjuntos / enumerações
  'in': 'O valor selecionado para {{ field }} é inválido.',
  'notIn': 'O valor selecionado para {{ field }} é inválido.',
  'enum': 'O valor selecionado para {{ field }} é inválido.',
  'literal': 'O campo {{ field }} deve ser {{ expectedValue }}.',
  'number.in': 'O valor selecionado para {{ field }} é inválido.',

  // Números
  'min': 'O campo {{ field }} deve ser no mínimo {{ min }}.',
  'max': 'O campo {{ field }} deve ser no máximo {{ max }}.',
  'range': 'O campo {{ field }} deve estar entre {{ min }} e {{ max }}.',
  'positive': 'O campo {{ field }} deve ser um número positivo.',
  'negative': 'O campo {{ field }} deve ser um número negativo.',
  'decimal': 'O campo {{ field }} deve ter {{ digits }} casas decimais.',
  'withoutDecimals': 'O campo {{ field }} deve ser um número inteiro.',
  'accepted': 'O campo {{ field }} deve ser aceito.',

  // Listas / registros
  'array.minLength': 'O campo {{ field }} deve ter no mínimo {{ min }} itens.',
  'array.maxLength': 'O campo {{ field }} deve ter no máximo {{ max }} itens.',
  'array.fixedLength': 'O campo {{ field }} deve conter {{ size }} itens.',
  'distinct': 'O campo {{ field }} possui valores duplicados.',
  'record.minLength': 'O campo {{ field }} deve ter no mínimo {{ min }} itens.',
  'record.maxLength': 'O campo {{ field }} deve ter no máximo {{ max }} itens.',
  'record.fixedLength': 'O campo {{ field }} deve conter {{ size }} itens.',

  // Uniões
  'union': 'Valor inválido informado para o campo {{ field }}.',
  'unionGroup': 'Valor inválido informado para o campo {{ field }}.',
  'unionOfTypes': 'Valor inválido informado para o campo {{ field }}.',

  // Datas
  'date': 'O campo {{ field }} deve ser uma data válida.',
  'date.equals': 'O campo {{ field }} deve ser igual a {{ expectedValue }}.',
  'date.after': 'O campo {{ field }} deve ser uma data posterior a {{ expectedValue }}.',
  'date.before': 'O campo {{ field }} deve ser uma data anterior a {{ expectedValue }}.',
  'date.afterOrEqual': 'O campo {{ field }} deve ser uma data igual ou posterior a {{ expectedValue }}.',
  'date.beforeOrEqual': 'O campo {{ field }} deve ser uma data igual ou anterior a {{ expectedValue }}.',
  'date.sameAs': 'O campo {{ field }} deve ser igual ao campo {{ otherField }}.',
  'date.notSameAs': 'O campo {{ field }} deve ser diferente do campo {{ otherField }}.',
  'date.afterField': 'O campo {{ field }} deve ser uma data posterior a {{ otherField }}.',
  'date.afterOrSameAs': 'O campo {{ field }} deve ser uma data igual ou posterior a {{ otherField }}.',
  'date.beforeField': 'O campo {{ field }} deve ser uma data anterior a {{ otherField }}.',
  'date.beforeOrSameAs': 'O campo {{ field }} deve ser uma data igual ou anterior a {{ otherField }}.',
  'date.weekend': 'O campo {{ field }} deve ser um final de semana.',
  'date.weekday': 'O campo {{ field }} deve ser um dia útil.',
}

/**
 * Tradução dos nomes de campos comuns. O nome (chave) deve bater com a chave
 * usada no schema do validator; o valor é como o campo aparece nas mensagens.
 * Campos não listados aparecem com seu nome técnico original.
 */
const fields = {
  title: 'título',
  name: 'nome',
  email: 'e-mail',
  password: 'senha',
  password_confirmation: 'confirmação de senha',
  excerpt: 'resumo',
  content: 'conteúdo',
  status: 'status',
  category_id: 'categoria',
  published_at: 'data de publicação',
  cpf: 'CPF',
  answers: 'respostas',
  suggestion: 'sugestão',
  slug: 'identificador',
  description: 'descrição',
  url: 'URL',
  link: 'link',
  phone: 'telefone',
  date: 'data',
  start_date: 'data inicial',
  end_date: 'data final',
  year: 'ano',
  value: 'valor',
  file: 'arquivo',
  image: 'imagem',
  role: 'papel',
  permissions: 'permissões',
}

vine.messagesProvider = new SimpleMessagesProvider(messages, fields)
