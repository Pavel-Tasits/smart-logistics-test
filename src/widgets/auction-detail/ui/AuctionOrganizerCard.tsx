import { Anchor, Card, Stack, Text, Title } from '@mantine/core';
import type { AuctionDetailVM } from '@/entities/auction';
import { DELAY_TYPE_LABEL } from '../model/labels';
import { DetailField } from './DetailField';

interface AuctionOrganizerCardProps {
  organizer: AuctionDetailVM['organizer'];
  contacts: AuctionDetailVM['contacts'];
  payment: AuctionDetailVM['payment'];
}

export function AuctionOrganizerCard({
  organizer,
  contacts,
  payment,
}: AuctionOrganizerCardProps) {
  return (
    <Card withBorder radius="md" padding="md" h="100%">
      <Stack component="dl" gap="sm">
        <Title order={5}>Организатор и оплата</Title>

        <DetailField label="Организатор">{organizer.name}</DetailField>

        {organizer.inn && (
          <DetailField label="ИНН / КПП">
            {organizer.inn}
            {organizer.kpp ? ` / ${organizer.kpp}` : ''}
          </DetailField>
        )}

        {contacts.length > 0 && (
          <DetailField label="Контакты">
            <Stack gap={2}>
              {contacts.map((contact, index) => (
                <Text
                  key={`${contact.phone ?? contact.name}-${index}`}
                  component="span"
                  size="sm"
                >
                  {contact.name && `${contact.name}: `}

                  {contact.phone ? (
                    <Anchor href={`tel:${contact.phone}`} size="sm">
                      {contact.phone}
                    </Anchor>
                  ) : (
                    '—'
                  )}
                </Text>
              ))}
            </Stack>
          </DetailField>
        )}

        <DetailField label="Форма оплаты">{payment.form ?? '—'}</DetailField>

        {payment.condition && (
          <DetailField label="Условие">{payment.condition}</DetailField>
        )}

        {payment.delay != null && (
          <DetailField label="Отсрочка">
            {payment.delay} {payment.delayType ? DELAY_TYPE_LABEL[payment.delayType] : ''}
          </DetailField>
        )}
      </Stack>
    </Card>
  );
}
